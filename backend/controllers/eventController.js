import Event from '../models/Event.js';

// Get all events
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.upcoming === 'true') {
      filter.startDate = { $gte: new Date() };
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name branch year profilePicture')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name branch year skills profilePicture')
      .populate('registeredUsers.user', 'name branch year profilePicture')
      .populate('interestedUsers.user', 'name branch year profilePicture');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.user._id };
    const event = new Event(eventData);

    await event.save();
    await event.populate('organizer', 'name branch year profilePicture');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('organizer', 'name branch year profilePicture');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredUsers.some(
      reg => reg.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check max participants
    if (event.maxParticipants && event.registeredUsers.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.registeredUsers.push({ user: req.user._id });
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark interest in event
const toggleInterest = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const interestIndex = event.interestedUsers.findIndex(
      interest => interest.user.toString() === req.user._id.toString()
    );

    if (interestIndex > -1) {
      event.interestedUsers.splice(interestIndex, 1);
    } else {
      event.interestedUsers.push({ user: req.user._id });
    }

    await event.save();
    res.json({
      message: interestIndex > -1 ? 'Interest removed' : 'Interest marked',
      interestedCount: event.interestedUsers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  toggleInterest
};
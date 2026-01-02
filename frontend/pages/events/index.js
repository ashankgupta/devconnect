import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    upcoming: true,
    search: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.upcoming) queryParams.append('upcoming', 'true');
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/events?${queryParams}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleRegister = async (eventId) => {
    if (!user) return;

    try {
      await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh events
      fetchEvents();
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event');
    }
  };

  const handleInterest = async (eventId) => {
    if (!user) return;

    try {
      await fetch(`/api/events/${eventId}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error('Error updating interest:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Events</h1>
        {user && (
          <Link href="/events/create" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Filter Events</h2>
          </div>
          <button
            onClick={() => setFilters({ type: '', upcoming: true, search: '' })}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear All</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Events</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or description..."
                className="input-field w-full pl-10 pr-4 py-3 bg-gray-700 text-white"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Event Type Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
            <div className="relative">
              <select
                className="input-field w-full py-3 appearance-none pr-10 bg-gray-700 text-white"
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
              >
                <option value="">All Event Types</option>
                <option value="hackathon">🏆 Hackathon</option>
                <option value="workshop">🛠️ Workshop</option>
                <option value="seminar">🎓 Seminar</option>
                <option value="meetup">🤝 Meetup</option>
                <option value="competition">🏅 Competition</option>
              </select>
              <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Upcoming Events Checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Filter</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
              <input
                type="checkbox"
                id="upcoming"
                checked={filters.upcoming}
                onChange={(e) => handleFilterChange({ upcoming: e.target.checked })}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="upcoming" className="text-gray-200 font-medium cursor-pointer flex items-center space-x-2">
                <span className="text-green-400">📅</span>
                <span>Show only upcoming events</span>
              </label>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.search || filters.type || !filters.upcoming) && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Active filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-200">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange({ search: '' })}
                    className="ml-2 text-blue-300 hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900 text-purple-200">
                  Type: {filters.type}
                  <button
                    onClick={() => handleFilterChange({ type: '' })}
                    className="ml-2 text-purple-300 hover:text-purple-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {!filters.upcoming && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900 text-green-200">
                  All Events
                  <button
                    onClick={() => handleFilterChange({ upcoming: true })}
                    className="ml-2 text-green-300 hover:text-green-100"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-bounce">📅</div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">No events found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Be the first to organize an amazing event! Create workshops, hackathons, or meetups to connect with the community.</p>
          {user?.isAdmin && (
            <Link href="/events/create" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
              Create the first event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-white hover:text-green-400 transition-colors">
                      <Link href={`/events/${event._id}`}>
                        {event.title}
                      </Link>
                    </h3>
                    {new Date(event.startDate) < new Date() && (
                      <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Past Event
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium capitalize">
                      {event.type}
                    </span>
                    {event.isVirtual && (
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                        🌐 Virtual
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                {event.description}
              </p>

              <div className="space-y-3 mb-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">📅</span>
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  <span className="text-gray-500">→</span>
                  <span>{new Date(event.endDate).toLocaleDateString()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400">👥</span>
                  <span>{event.registeredUsers?.length || 0} registered</span>
                  {event.maxParticipants && (
                    <span className="text-gray-500">of {event.maxParticipants}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span className="text-red-400">❤️</span>
                    <span>{event.interestedUsers?.length || 0}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {user && (
                    <>
                      <button
                        onClick={() => handleInterest(event._id)}
                        className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                          event.interestedUsers?.some(interest => interest.user === user._id)
                            ? 'bg-red-800 text-red-200 hover:bg-red-700'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        👍 Interested
                      </button>
                      <button
                        onClick={() => handleRegister(event._id)}
                        className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                          event.registeredUsers?.some(reg => reg.user === user._id)
                            ? 'bg-green-800 text-green-200 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        disabled={event.registeredUsers?.some(reg => reg.user === user._id)}
                      >
                        {event.registeredUsers?.some(reg => reg.user === user._id) ? 'Registered' : 'Register'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
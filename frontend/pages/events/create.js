import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateEvent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    location: '',
    isVirtual: false,
    virtualLink: '',
    maxParticipants: '',
    requirements: '',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/events/${data.event._id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-8xl mb-6">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Access Denied</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to create an event.</p>
          <Link href="/login" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="Enter your event title"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field w-full resize-none py-3 text-base bg-gray-700 text-white"
              rows={6}
              placeholder="Describe your event in detail..."
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              required
            >
              <option value="">Select event type</option>
              <option value="hackathon">🏆 Hackathon</option>
              <option value="workshop">🛠️ Workshop</option>
              <option value="seminar">🎓 Seminar</option>
              <option value="meetup">🤝 Meetup</option>
              <option value="competition">🏅 Competition</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field w-full py-3 text-base bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field w-full py-3 text-base bg-gray-700 text-white"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="Physical location or 'Online'"
            />
          </div>

          {/* Virtual Event */}
          <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <input
              type="checkbox"
              id="isVirtual"
              name="isVirtual"
              checked={formData.isVirtual}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
            />
            <div>
              <label htmlFor="isVirtual" className="text-gray-200 font-medium cursor-pointer">
                Virtual Event
              </label>
              <p className="text-sm text-gray-400">Check if this is an online event</p>
            </div>
          </div>

          {/* Virtual Link */}
          {formData.isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Virtual Meeting Link
              </label>
              <input
                type="url"
                name="virtualLink"
                value={formData.virtualLink}
                onChange={handleChange}
                className="input-field w-full py-3 text-base bg-gray-700 text-white"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="input-field w-full resize-none py-3 text-base bg-gray-700 text-white"
              rows={3}
              placeholder="Any prerequisites or requirements for participants..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.requirements.length}/500 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="web-development, ai, blockchain, etc. (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Help others find your event</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link
              href="/events"
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-blue-400 mr-2">💡</span>
          Tips for a Great Event
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">📝 Clear Description</h4>
            <p>Provide detailed information about what participants will learn or accomplish.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🏷️ Relevant Tags</h4>
            <p>Use specific tags to help participants find events that match their interests.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">📅 Accurate Timing</h4>
            <p>Set realistic start and end times. Consider time zones for virtual events.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">👥 Participant Limits</h4>
            <p>Set appropriate participant limits based on your event format and resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      setEvent(data);
      setIsRegistered(data.registeredUsers?.some(reg => reg.user === user?._id) || false);
      setIsInterested(data.interestedUsers?.some(interest => interest.user === user?._id) || false);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setIsRegistered(true);
        fetchEvent(); // Refresh event data
        alert('Successfully registered for the event!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event');
    }
  };

  const handleInterest = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/events/${id}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setIsInterested(!isInterested);
        fetchEvent(); // Refresh event data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update interest');
      }
    } catch (error) {
      console.error('Error updating interest:', error);
      alert('Failed to update interest');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-12">Event not found</div>;
  }

  const isOrganizer = user && event.organizer._id === user._id;
  const isPast = new Date(event.endDate) < new Date();
  const canRegister = !isPast && !isRegistered && (!event.maxParticipants || event.registeredUsers?.length < event.maxParticipants);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Event Header */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">{event.title}</h1>
            <div className="flex items-center space-x-4 text-gray-400 mb-4">
              <Link href={`/profile/${event.organizer._id}`} className="flex items-center space-x-2 hover:text-blue-600">
                <img
                  src={event.organizer.profilePicture || '/default-avatar.png'}
                  alt={event.organizer.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{event.organizer.name}</span>
              </Link>
              <span>•</span>
              <span>{event.organizer.branch} {event.organizer.year}</span>
              <span>•</span>
              <span>{new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {event.isFeatured && (
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              ⭐ Featured Event
            </span>
          )}
        </div>

        {/* Event Type & Status */}
        <div className="flex items-center space-x-4 mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
            {event.type}
          </span>
          {event.isVirtual && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🌐 Virtual
            </span>
          )}
          {isPast && (
            <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ⏰ Past Event
            </span>
          )}
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
        </div>

        {/* Event Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">📅</span>
              <div>
                <p className="text-gray-300">Start: {new Date(event.startDate).toLocaleString()}</p>
                <p className="text-gray-300">End: {new Date(event.endDate).toLocaleString()}</p>
              </div>
            </div>
            {event.location && (
              <div className="flex items-center space-x-2">
                <span className="text-green-400">📍</span>
                <span className="text-gray-300">{event.location}</span>
              </div>
            )}
            {event.isVirtual && event.virtualLink && (
              <div className="flex items-center space-x-2">
                <span className="text-purple-400">🔗</span>
                <a
                  href={event.virtualLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Join Virtual Event
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-orange-400">👥</span>
              <span className="text-gray-300">
                {event.registeredUsers?.length || 0} registered
                {event.maxParticipants && ` of ${event.maxParticipants}`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400">❤️</span>
              <span className="text-gray-300">{event.interestedUsers?.length || 0} interested</span>
            </div>
          </div>
        </div>

        {/* Requirements */}
        {event.requirements && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Requirements</h3>
            <p className="text-gray-300">{event.requirements}</p>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.map((tag, index) => (
              <span key={index} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <button
                onClick={handleInterest}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isInterested ? 'bg-red-800 text-red-200' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <span>👍</span>
                <span>{event.interestedUsers?.length || 0}</span>
              </button>

              {!isPast && (
                <button
                  onClick={handleRegister}
                  disabled={isRegistered || !canRegister}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRegistered
                      ? 'bg-green-800 text-green-200 cursor-not-allowed'
                      : canRegister
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isRegistered ? 'Registered' : canRegister ? 'Register' : 'Full'}
                </button>
              )}
            </>
          )}

          {isOrganizer && (
            <Link href={`/events/${id}/edit`} className="btn-secondary">
              Edit Event
            </Link>
          )}
        </div>
      </div>

      {/* Registered Users */}
      {event.registeredUsers && event.registeredUsers.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Registered Participants ({event.registeredUsers.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {event.registeredUsers.map((registration, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <img
                  src={registration.user.profilePicture || '/default-avatar.png'}
                  alt={registration.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <Link href={`/profile/${registration.user._id}`} className="font-medium text-gray-200 hover:text-green-400">
                    {registration.user.name}
                  </Link>
                  <p className="text-sm text-gray-400">{registration.user.branch} {registration.user.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interested Users */}
      {event.interestedUsers && event.interestedUsers.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Interested Users ({event.interestedUsers.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {event.interestedUsers.map((interest, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <img
                  src={interest.user.profilePicture || '/default-avatar.png'}
                  alt={interest.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <Link href={`/profile/${interest.user._id}`} className="font-medium text-gray-200 hover:text-green-400">
                    {interest.user.name}
                  </Link>
                  <p className="text-sm text-gray-400">{interest.user.branch} {interest.user.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
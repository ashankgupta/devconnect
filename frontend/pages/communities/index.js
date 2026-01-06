import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, [search]);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`/api/communities?search=${search}`);
      setCommunities(response.data.communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityName) => {
    try {
      const response = await axios.post(`/api/communities/${communityName}/join`);
      console.log('Join response:', response.data);
      fetchCommunities(); // Refresh to update member counts
    } catch (error) {
      console.error('Error joining community:', error.response?.data || error);
      alert(`Error joining community: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const leaveCommunity = async (communityName) => {
    try {
      const response = await axios.post(`/api/communities/${communityName}/leave`);
      console.log('Leave response:', response.data);
      fetchCommunities(); // Refresh to update member counts
    } catch (error) {
      console.error('Error leaving community:', error.response?.data || error);
      alert(`Error leaving community: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading communities...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Communities</h1>
        {user && (
          <Link href="/communities/create" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500">
            Create Community
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Communities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <div key={community._id} className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Link href={`/communities/${community.name}`}>
                  <h3 className="text-xl font-semibold text-green-400 hover:text-green-300 cursor-pointer">
                    r/{community.name}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm mt-1">{community.displayName}</p>
              </div>
              {community.iconImage && (
                <img src={community.iconImage} alt={community.name} className="w-12 h-12 rounded-full ml-4" />
              )}
            </div>

            <p className="text-gray-300 mb-4 line-clamp-3">{community.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>{community.memberCount} members</span>
              <span>{community.discussionCount} discussions</span>
            </div>

            {user && (
              <div className="flex space-x-2">
                <Link
                  href={`/communities/${community.name}`}
                  className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded text-center hover:bg-gray-600"
                >
                  View
                </Link>
                {community.members.some(member => member.user === user._id) ? (
                  <button
                    onClick={() => leaveCommunity(community.name)}
                    className="bg-red-900 text-red-300 px-4 py-2 rounded hover:bg-red-800"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => joinCommunity(community.name)}
                    className="bg-green-900 text-green-300 px-4 py-2 rounded hover:bg-green-800"
                  >
                    Join
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No communities found.</p>
          {user && (
            <Link href="/communities/create" className="text-green-600 hover:text-green-700">
              Create the first community
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
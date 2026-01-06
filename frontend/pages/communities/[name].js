import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function CommunityPage() {
  const router = useRouter();
  const { name } = router.query;
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (name) {
      fetchCommunity();
    }
  }, [name]);

  useEffect(() => {
    if (community && community._id) {
      fetchDiscussions();
    }
  }, [community]);

  const fetchCommunity = async () => {
    try {
      const response = await axios.get(`/api/communities/${name}`);
      setCommunity(response.data);
      setIsMember(response.data.members.some(member => member.user === user?._id));
    } catch (error) {
      console.error('Error fetching community:', error);
    }
  };

  const fetchDiscussions = async () => {
    try {
      if (community && community._id) {
        const response = await axios.get(`/api/discussions?community=${community._id}`);
        setDiscussions(response.data.discussions);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async () => {
    try {
      const response = await axios.post(`/api/communities/${name}/join`);
      console.log('Join response:', response.data);
      setIsMember(true);
      fetchCommunity(); // Refresh member count
    } catch (error) {
      console.error('Error joining community:', error.response?.data || error);
      alert(`Error joining community: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const leaveCommunity = async () => {
    try {
      const response = await axios.post(`/api/communities/${name}/leave`);
      console.log('Leave response:', response.data);
      setIsMember(false);
      fetchCommunity(); // Refresh member count
    } catch (error) {
      console.error('Error leaving community:', error.response?.data || error);
      alert(`Error leaving community: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const deleteCommunity = async () => {
    if (!confirm('Are you sure you want to delete this community? This action cannot be undone and will delete all discussions in this community.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/communities/${name}`);
      console.log('Delete response:', response.data);
      alert('Community deleted successfully');
      router.push('/communities'); // Redirect to communities list
    } catch (error) {
      console.error('Error deleting community:', error.response?.data || error);
      alert(`Error deleting community: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!community) {
    return <div className="text-center py-8">Community not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Community Header */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {community.iconImage && (
              <img src={community.iconImage} alt={community.name} className="w-16 h-16 rounded-full mr-4" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">r/{community.name}</h1>
              <p className="text-gray-400">{community.displayName}</p>
            </div>
          </div>
          {user && (
            <div className="flex space-x-2">
              {isMember ? (
                <button
                  onClick={leaveCommunity}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  Leave Community
                </button>
              ) : (
                <button
                  onClick={joinCommunity}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                >
                  Join Community
                </button>
              )}
              {isMember && (
                <Link
                  href={`/discussions/create?community=${community._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                  Create Discussion
                </Link>
              )}
              {user && community.creator && user._id === community.creator._id && (
                <button
                  onClick={deleteCommunity}
                  className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 border border-red-600"
                  title="Delete this community (only available to creator)"
                >
                  Delete Community
                </button>
              )}
            </div>
          )}
        </div>
        <p className="mt-4 text-gray-300">{community.description}</p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
          <span>{community.memberCount} members</span>
          <span>{community.discussionCount} discussions</span>
          <span>Created by {community.creator.name}</span>
        </div>
      </div>

      {/* Discussions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Discussions</h2>

        {discussions.map((discussion) => (
          <div key={discussion._id} className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/discussions/${discussion._id}`}>
                  <h3 className="text-xl font-semibold text-green-400 hover:text-green-300 cursor-pointer mb-2">
                    {discussion.title}
                  </h3>
                </Link>
                <p className="text-gray-300 mb-3 line-clamp-2">{discussion.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Posted by {discussion.author.name}</span>
                  <span>{discussion.likeCount} likes</span>
                  <span>{discussion.commentCount} comments</span>
                  <span>{discussion.viewCount} views</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {discussions.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg shadow-md border border-gray-700">
            <p className="text-gray-400 mb-4">No discussions yet.</p>
            {isMember && (
              <Link
                href={`/discussions/create?community=${community._id}`}
                className="text-green-400 hover:text-green-300"
              >
                Start the first discussion
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
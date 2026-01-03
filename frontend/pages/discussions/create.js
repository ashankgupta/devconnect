import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function CreateDiscussion() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    community: router.query.community || '',
    category: 'general',
    tags: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserCommunities();
    }
  }, [user]);

  const fetchUserCommunities = async () => {
    try {
      // For now, we'll fetch all communities and filter client-side
      // In a real app, you'd want an endpoint to get user's communities
      const response = await axios.get('/api/communities');
      // Filter to only communities where user is a member
      const userCommunities = response.data.communities.filter(community =>
        community.members.some(member => member.user === user._id)
      );
      setCommunities(userCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert tags from comma-separated string to array
      const discussionData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await axios.post('/api/discussions', discussionData);

      router.push(`/discussions/${response.data.discussion._id}`);
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert(error.response?.data?.message || 'Failed to create discussion');
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
          <p className="text-gray-500 mb-6">You need to be logged in to create a discussion.</p>
          <Link href="/login" className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
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
          <Link href="/discussions" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Start New Discussion</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
           {/* Title */}
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">
               Discussion Title *
             </label>
             <input
               type="text"
               name="title"
               value={formData.title}
               onChange={handleChange}
               className="input-field w-full py-3 text-base bg-gray-700 text-white"
               placeholder="What's your discussion about?"
               required
               maxLength={200}
             />
             <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
           </div>

           {/* Community */}
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">
               Community *
             </label>
             <div className="relative">
               <select
                 name="community"
                 value={formData.community}
                 onChange={handleChange}
                 className="input-field w-full py-3 text-base bg-gray-700 text-white appearance-none pr-10"
                 required
               >
                 <option value="">Select a community</option>
                 {communities.map((community) => (
                   <option key={community._id} value={community._id}>
                     r/{community.name} - {community.displayName}
                   </option>
                 ))}
               </select>
               <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </div>
             {communities.length === 0 && (
               <p className="text-sm text-yellow-400 mt-2">
                 You need to join a community first. <Link href="/communities" className="underline">Browse communities</Link>
               </p>
             )}
           </div>

           {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field w-full py-3 text-base bg-gray-700 text-white appearance-none pr-10"
                required
              >
                <option value="general">💬 General Discussion</option>
                <option value="collaboration">🤝 Collaboration</option>
                <option value="tech-discussion">💻 Tech Discussion</option>
                <option value="help">❓ Help & Support</option>
                <option value="showcase">🚀 Showcase</option>
              </select>
              <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="input-field w-full resize-none py-3 text-base bg-gray-700 text-white"
              rows={8}
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              required
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.content.length}/5000 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="javascript, react, career, design, etc. (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Help others find your discussion</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link
              href="/discussions"
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Start Discussion'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-purple-400 mr-2">💡</span>
          Tips for Great Discussions
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">🏠 Choose Community</h4>
            <p>Select the appropriate community where your discussion belongs.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">📝 Clear Title</h4>
            <p>Choose a descriptive title that clearly explains what your discussion is about.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🎯 Choose Category</h4>
            <p>Select the most appropriate category to help others find your discussion.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">📖 Detailed Content</h4>
            <p>Provide enough context and details to spark meaningful conversations.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🏷️ Use Tags</h4>
            <p>Add relevant tags to increase visibility and help with searchability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
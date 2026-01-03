import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Discussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchDiscussions();
  }, [filters]);

  const fetchDiscussions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/discussions?${queryParams}`);
      const data = await response.json();
      setDiscussions(data.discussions || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Discussions</h1>
        {user && (
          <Link href="/discussions/create" className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            Start Discussion
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-lg shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Filter Discussions</h2>
          </div>
          <button
            onClick={() => setFilters({ category: '', search: '' })}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear All</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Discussions</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or content..."
                className="input-field w-full pl-10 pr-4 py-3 bg-gray-700 text-white"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <div className="relative">
              <select
                className="input-field w-full py-3 text-base appearance-none pr-10 bg-gray-700 text-white"
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="general">💬 General</option>
                <option value="collaboration">🤝 Collaboration</option>
                <option value="tech-discussion">💻 Tech Discussion</option>
                <option value="help">❓ Help</option>
                <option value="showcase">🚀 Showcase</option>
              </select>
              <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.search || filters.category) && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Active filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-900 text-orange-200">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange({ search: '' })}
                    className="ml-2 text-orange-300 hover:text-orange-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-900 text-amber-200">
                  Category: {filters.category.replace('-', ' ')}
                  <button
                    onClick={() => handleFilterChange({ category: '' })}
                    className="ml-2 text-amber-300 hover:text-amber-100"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Discussions List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-bounce">💬</div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">No discussions found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Be the first to start a conversation! Share your thoughts, ask questions, or showcase your work.</p>
          {user && (
            <Link href="/discussions/create" className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start the first discussion
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion._id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-white hover:text-orange-400 transition-colors">
                      <Link href={`/discussions/${discussion._id}`}>
                        {discussion.title}
                      </Link>
                    </h3>
                    {discussion.isPinned && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                        📌 Pinned
                      </span>
                    )}
                    {discussion.isFeatured && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse ml-2">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-gray-400 text-sm mb-3">
                    <Link href={`/profile/${discussion.author._id}`} className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
                      <img
                        src={discussion.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(discussion.author.name)}&background=ea580c&color=ffffff&size=32`}
                        alt={discussion.author.name}
                        className="w-8 h-8 rounded-full border-2 border-orange-500"
                      />
                      <span className="font-medium">{discussion.author.name}</span>
                    </Link>
                    <span>•</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium capitalize">
                      {discussion.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                {discussion.content}
              </p>

              {discussion.tags && discussion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {discussion.tags.slice(0, 4).map((tag, index) => (
                    <span key={index} className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-600 hover:border-green-400 transition-colors">
                      #{tag}
                    </span>
                  ))}
                  {discussion.tags.length > 4 && (
                    <span className="text-gray-500 text-sm bg-gray-700 px-2 py-1 rounded-full">
                      +{discussion.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span className="text-red-400">❤️</span>
                    <span>{discussion.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-400">💬</span>
                    <span>{discussion.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-400">👁️</span>
                    <span>{discussion.viewCount || 0}</span>
                  </div>
                </div>
                <Link href={`/discussions/${discussion._id}`} className="text-orange-400 hover:text-orange-300 font-medium transition-colors flex items-center space-x-1">
                  <span>Read More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
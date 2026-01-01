import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    lookingForTeammates: false,
    techStack: '',
    search: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.lookingForTeammates) queryParams.append('lookingForTeammates', 'true');
      if (filters.techStack) queryParams.append('techStack', filters.techStack);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/projects?${queryParams}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
        <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Projects</h1>
        {user && (
          <Link href="/projects/create" className="btn-primary">
            Create Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Filter Projects</h2>
          </div>
          <button
            onClick={() => setFilters({ lookingForTeammates: false, techStack: '', search: '' })}
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
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Projects</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Project title or description..."
                className="input-field w-full pl-10 pr-4 py-3 text-base bg-gray-700 text-white"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Tech Stack Input */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack</label>
            <input
              type="text"
              placeholder="React, Node.js, Python..."
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              value={filters.techStack}
              onChange={(e) => handleFilterChange({ techStack: e.target.value })}
            />
          </div>

          {/* Looking for Teammates Checkbox */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Status</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
              <input
                type="checkbox"
                id="lookingForTeammates"
                checked={filters.lookingForTeammates}
                onChange={(e) => handleFilterChange({ lookingForTeammates: e.target.checked })}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="lookingForTeammates" className="text-gray-200 font-medium cursor-pointer flex items-center space-x-2">
                <span className="text-green-400">👥</span>
                <span>Looking for teammates</span>
              </label>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.search || filters.techStack || filters.lookingForTeammates) && (
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
              {filters.techStack && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900 text-purple-200">
                  Tech: {filters.techStack}
                  <button
                    onClick={() => handleFilterChange({ techStack: '' })}
                    className="ml-2 text-purple-300 hover:text-purple-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.lookingForTeammates && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900 text-green-200">
                  Seeking Team
                  <button
                    onClick={() => handleFilterChange({ lookingForTeammates: false })}
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

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-bounce">🚀</div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">No projects found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Be the first to showcase your amazing project! Start building and inspire others in the community.</p>
          {user && (
            <Link href="/projects/create" className="btn-primary text-lg px-8 py-3">
              Create the first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl hover:border-gray-600 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              {project.images && project.images.length > 0 && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <Link href={`/projects/${project._id}`} className="hover:text-green-400 transition-colors">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    by {project.owner.name} • {project.owner.branch} {project.owner.year}
                  </p>
                </div>
                 {project.lookingForTeammates && (
                   <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                     Seeking Team
                   </span>
                 )}
              </div>

              <p className="text-gray-300 mb-4 line-clamp-3">
                {project.description}
              </p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.slice(0, 3).map((tech, index) => (
                    <span key={index} className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="text-gray-500 text-xs bg-gray-700 px-2 py-1 rounded-full">+{project.techStack.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>❤️ {project.likes?.length || 0}</span>
                  <span>💬 {project.comments?.length || 0}</span>
                </div>
                <Link href={`/projects/${project._id}`} className="text-green-400 hover:text-green-300 transition-colors">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
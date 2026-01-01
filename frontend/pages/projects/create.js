import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateProject() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    demoLink: '',
    lookingForTeammates: false,
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
      // Convert techStack and tags from comma-separated strings to arrays
      const projectData = {
        ...formData,
        techStack: formData.techStack.split(',').map(tech => tech.trim()).filter(tech => tech),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/projects/${data.project._id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
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
          <p className="text-gray-500 mb-6">You need to be logged in to create a project.</p>
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
          <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create New Project</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="Enter your project title"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
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
              placeholder="Describe your project in detail..."
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tech Stack
            </label>
            <input
              type="text"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              className="input-field w-full py-3 text-base bg-gray-700 text-white"
              placeholder="React, Node.js, MongoDB, etc. (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
          </div>

          {/* Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub Repository
              </label>
              <input
                type="url"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="input-field w-full py-3 text-base bg-gray-700 text-white"
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Live Demo
              </label>
              <input
                type="url"
                name="demoLink"
                value={formData.demoLink}
                onChange={handleChange}
                className="input-field w-full py-3 text-base bg-gray-700 text-white"
                placeholder="https://your-demo-link.com"
              />
            </div>
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
              placeholder="web-development, mobile-app, ai, etc. (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Help others find your project</p>
          </div>

          {/* Looking for Teammates */}
          <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <input
              type="checkbox"
              id="lookingForTeammates"
              name="lookingForTeammates"
              checked={formData.lookingForTeammates}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
            />
            <div>
              <label htmlFor="lookingForTeammates" className="text-gray-200 font-medium cursor-pointer">
                Looking for teammates
              </label>
              <p className="text-sm text-gray-400">Let others know you're open to collaboration</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link
              href="/projects"
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
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-blue-400 mr-2">💡</span>
          Tips for a Great Project
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">📝 Description</h4>
            <p>Write a clear, detailed description of what your project does, its features, and how to use it.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🏷️ Tags</h4>
            <p>Use relevant tags to help others discover your project in searches.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🔗 Links</h4>
            <p>Include GitHub repository and live demo links to showcase your work.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">👥 Collaboration</h4>
            <p>Check "Looking for teammates" if you want to find collaborators for your project.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
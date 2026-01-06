import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function CreateCommunity() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    rules: [{ title: '', description: '' }],
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...formData.rules];
    newRules[index][field] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, { title: '', description: '' }]
    }));
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      setError('Community name can only contain letters, numbers, underscores, and dashes (no spaces)');
      setLoading(false);
      return;
    }

    if (formData.name.length < 3 || formData.name.length > 50) {
      setError('Community name must be between 3 and 50 characters');
      setLoading(false);
      return;
    }

    try {
      // Filter out empty rules
      const filteredRules = formData.rules.filter(rule => rule.title.trim() || rule.description.trim());

      const response = await axios.post('/api/communities', {
        ...formData,
        rules: filteredRules
      });

      router.push(`/communities/${response.data.community.name}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating community');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Please log in to create a community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/communities" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create Community</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Community Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., programming, webdev, react"
            pattern="^[a-zA-Z0-9_-]+$"
            title="Community name can only contain letters, numbers, underscores, and dashes (no spaces)"
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be your community's URL: r/{formData.name || 'name'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Only letters, numbers, underscores, and dashes allowed (no spaces)
          </p>
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="e.g., Programming Help, Web Development"
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe what your community is about..."
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Community Rules
          </label>
          {formData.rules.map((rule, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-600 bg-gray-800 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Rule {index + 1}</span>
                {formData.rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Rule title"
                value={rule.title}
                onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                placeholder="Rule description"
                value={rule.description}
                onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addRule}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            + Add Rule
          </button>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-300">Make this community private</span>
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Private communities require approval to join.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
          <Link
            href="/communities"
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
              'Create Community'
            )}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
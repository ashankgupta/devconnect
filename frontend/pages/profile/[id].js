import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    branch: '',
    year: 1,
    skills: [],
    github: '',
    linkedin: '',
    bio: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserProjects();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm({
          name: data.name || '',
          branch: data.branch || '',
          year: data.year || 1,
          skills: data.skills || [],
          github: data.github || '',
          linkedin: data.linkedin || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await fetch(`/api/projects?owner=${id}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setIsEditing(false);
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !editForm.skills.includes(skillInput.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const isOwnProfile = currentUser && currentUser.id === id;

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-start space-x-6">
          <img
            src={user.profilePicture || '/default-avatar.png'}
            alt={user.name}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black">{user.name}</h1>
                <p className="text-gray-600">{user.branch} {user.year} • {user.email}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-secondary"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            <div className="flex space-x-4 mb-4">
              {user.github && (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  GitHub
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  LinkedIn
                </a>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && isOwnProfile && (
        <div className="card mb-8">
          {/* 1. Fix the main heading color */}
          <h2 className="text-xl font-semibold mb-4 text-white">Edit Profile</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                {/* 2. Fix 'Name' label color */}
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                {/* 3. Fix 'Branch' label color */}
                <label className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
                <select
                  className="input-field"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  required
                >
                  {/* ... options ... */}
                </select>
              </div>
            </div>
      
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                {/* 4. Fix 'Year' label color */}
                <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                <select
                  className="input-field"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  required
                >
                  {/* ... options ... */}
                </select>
              </div>
              <div>
                {/* 5. Fix 'GitHub Username' label color */}
                <label className="block text-sm font-medium text-gray-300 mb-1">GitHub Username</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.github}
                  onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  placeholder="username"
                />
              </div>
            </div>
      
            <div>
              {/* 6. Fix 'LinkedIn Profile' label color */}
              <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                className="input-field"
                value={editForm.linkedin}
                onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
      
            <div>
              {/* 7. Fix 'Bio' label color */}
              <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>
      
            <div>
              {/* 8. Fix 'Skills' label color */}
              <label className="block text-sm font-medium text-gray-300 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Add a skill"
                  value={skillInput}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button type="button" onClick={addSkill} className="btn-primary px-4">
                  Add
                </button>
              </div>
              {/* The skill tags below are fine because they use bg-blue-100 and text-blue-800, which are contrasting */}
              <div className="flex flex-wrap gap-2">
                {editForm.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
      
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p className="text-gray-500">
            {isOwnProfile ? 'You haven\'t created any projects yet.' : 'No projects yet.'}
            {isOwnProfile && (
              <Link href="/projects/create" className="text-blue-600 hover:text-blue-800 ml-1">
                Create your first project
              </Link>
            )}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">
                  <Link href={`/projects/${project._id}`} className="hover:text-blue-600">
                    {project.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>❤️ {project.likes?.length || 0}</span>
                    <span>💬 {project.comments?.length || 0}</span>
                  </div>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
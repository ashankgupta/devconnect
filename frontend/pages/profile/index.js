import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function MyProfile() {
  const { user: currentUser, updateProfile } = useAuth();
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
    bio: '',
    profilePicture: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if(!currentUser){
      return;
    }
    if (currentUser) {
      fetchUserProjects();
      setEditForm({
        name: currentUser.name || '',
        branch: currentUser.branch || '',
        year: currentUser.year || 1,
        skills: currentUser.skills || [],
        github: currentUser.github || '',
        linkedin: currentUser.linkedin || '',
        bio: currentUser.bio || '',
        profilePicture: currentUser.profilePicture || ''
      });
    }
  }, [currentUser]);

  const fetchUserProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects?owner=${currentUser._id}`);
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
    setUpdateError('');
    setSaving(true);

    const result = await updateProfile(editForm);

    if (result.success) {
      setIsEditing(false);
    } else {
      setUpdateError(result.error || 'Failed to update profile');
    }

    setSaving(false);
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
  
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please log in to view your profile.</p>
        <Link href="/login" className="btn-primary mt-4">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading your profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-2xl p-8 mb-8 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-16 right-16 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-white rounded-full"></div>
        </div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
           <div className="relative">
                  <img
                    className="h-16 w-16 rounded-full border-2 border-green-400 object-cover"
                    src={currentUser.profilePicture}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=4B5563&color=FFFFFF&size=64`; }}
                    alt=""
                  />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
           </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{currentUser.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-green-100">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    {currentUser.branch} {currentUser.year}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {currentUser.email}
                  </span>
                </div>
                {currentUser.isAdmin && (
                  <div className="inline-flex items-center bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium mt-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Administrator
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 md:mt-0 bg-white text-green-600 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Skills */}
            {currentUser.skills && currentUser.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-green-400">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm border border-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              {currentUser.github && (
                <a
                  href={`https://github.com/${currentUser.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors duration-200 border border-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
              {currentUser.linkedin && (
                <a
                  href={currentUser.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors duration-200 border border-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {currentUser.bio && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-600">
            <h3 className="text-xl font-semibold mb-3 text-green-400">About Me</h3>
            <p className="text-gray-300 leading-relaxed">{currentUser.bio}</p>
          </div>
        )}
      </div>

      {/* Edit Form */}
            {isEditing && (
              <div className="card overflow-hidden mb-8 bg-gray-900 border border-gray-700">
                {/* Header */}
           <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 px-8 py-8 shadow-2xl">
             <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-3xl font-bold text-white mb-2">Edit Profile</h2>
                 <p className="text-green-100 text-lg">Customize your profile to showcase your skills and personality</p>
               </div>
               <button
                 type="button"
                 onClick={() => setIsEditing(false)}
                 className="text-white hover:bg-white/20 p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
           </div>
      
                {updateError && (
                   <div className="bg-red-900 border border-red-600 text-red-200 px-6 py-4 mx-8 mt-6 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {updateError}
                    </div>
                  </div>
                )}
      
            <form onSubmit={handleEditSubmit} className="p-8 space-y-8">
             {/* Basic Information */}
             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
               <div className="flex items-center mb-6">
                 <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl mr-4 shadow-lg">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white">Basic Information</h3>
               </div>

               {/* Profile Picture Section */}
               <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                 <div className="flex flex-col items-center space-y-4">
                   <div className="relative">
                     <img
                       src={editForm.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name || 'User')}&background=4B5563&color=FFFFFF&size=120`}
                       alt="Profile Preview"
                       className="w-24 h-24 rounded-full object-cover border-4 border-green-500 shadow-xl"
                       onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name || 'User')}&background=4B5563&color=FFFFFF&size=120`; }}
                     />
                     <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                       </svg>
                     </div>
                   </div>
                   <div className="text-center">
                     <p className="text-sm text-gray-400 mb-2">Profile Picture</p>
                     <input
                       type="url"
                       className="input-field text-sm w-64 h-10 bg-gray-700 text-white"
                       value={editForm.profilePicture}
                       onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                       placeholder="https://example.com/photo.jpg"
                     />
                     <p className="text-xs text-gray-500 mt-1">URL to your profile image</p>
                   </div>
                 </div>

                 {/* Form Fields */}
                 <div className="flex-1 space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-semibold text-gray-300 mb-3">Full Name</label>
                       <input
                         type="text"
                         className="input-field w-full h-8 text-md text-center bg-gray-700 text-white"
                         value={editForm.name}
                         onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-300 mb-3">Branch</label>
                       <select
                         className="input-field w-full h-8 text-md text-center bg-gray-700 text-white"
                         value={editForm.branch}
                         onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                         required
                       >
                         <option value="">Select Branch</option>
                         <option value="CSE">CSE</option>
                         <option value="ECE">ECE</option>
                         <option value="ME">ME</option>
                         <option value="CE">CE</option>
                         <option value="EE">EE</option>
                         <option value="IT">IT</option>
                         <option value="Other">Other</option>
                       </select>
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-300 mb-3">Year</label>
                     <select
                       className="input-field w-full h-8 md:w-1/2 text-md text-center bg-gray-700 text-white"
                       value={editForm.year}
                       onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                       required
                     >
                       <option value={1}>1st Year</option>
                       <option value={2}>2nd Year</option>
                       <option value={3}>3rd Year</option>
                       <option value={4}>4th Year</option>
                     </select>
                   </div>
                 </div>
               </div>
             </div>

             {/* Social Links */}
             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
               <div className="flex items-center mb-6">
                 <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                   </svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white">Social Links</h3>
               </div>
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-semibold text-gray-300 mb-3">GitHub Username</label>
                   <div className="flex">
                     <span className="inline-flex items-center px-4 text-sm text-white bg-gradient-to-r from-gray-600 to-gray-700 rounded-l-lg shadow-md">
                       <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                       </svg>
                       github.com/
                     </span>
                     <input
                       type="text"
                       className="input-field flex-1 rounded-r-lg text-md text-center bg-gray-800 text-white"
                       value={editForm.github}
                       onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                       placeholder="username"
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-300 mb-3">LinkedIn Profile</label>
                   <input
                     type="url"
                     className="input-field w-full text-md text-center bg-gray-800 text-white"
                     value={editForm.linkedin}
                     onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                     placeholder="https://linkedin.com/in/username"
                   />
                 </div>
               </div>
             </div>

             {/* About */}
             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
               <div className="flex items-center mb-6">
                 <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl mr-4 shadow-lg">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white">About You</h3>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-300 mb-3">Bio</label>
                 <textarea
                   className="input-field w-full resize-none text-md text-white bg-gray-800"
                   rows={6}
                   value={editForm.bio}
                   onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                   placeholder="Tell us about yourself, your interests, what you're working on, and your goals..."
                 />
                 <p className="text-xs text-gray-500 mt-2">Share your story, skills, and aspirations. This will be visible on your profile.</p>
                </div>
              </div>

              {/* Skills */}
             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
               <div className="flex items-center mb-6">
                 <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl mr-4 shadow-lg">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                   </svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white">Skills & Technologies</h3>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-300 mb-3">Add Your Skills</label>
                 <div className="flex gap-4 mb-6">
                   <input
                     type="text"
                     className="input-field flex-1 text-md text-white bg-gray-800"
                     placeholder="e.g., React, Node.js, Python, Machine Learning"
                     value={skillInput}
                     onChange={(e) => setSkillInput(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                   />
                   <button
                     type="button"
                     onClick={addSkill}
                     className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-lg"
                   >
                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                     Add Skill
                   </button>
                 </div>
                 {editForm.skills.length > 0 && (
                   <div>
                     <p className="text-sm text-gray-300 mb-4">Your Skills:</p>
                     <div className="flex flex-wrap gap-3">
                       {editForm.skills.map((skill, index) => (
                         <span key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-green-800 to-green-700 text-green-100 border border-green-600 shadow-md">
                           <span className="mr-2">{skill}</span>
                           <button
                             type="button"
                             onClick={() => removeSkill(skill)}
                             className="text-green-300 hover:text-white font-bold hover:bg-green-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-200"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
                 {editForm.skills.length === 0 && (
                   <div className="text-center py-8">
                     <div className="text-4xl mb-4">⚡</div>
                     <p className="text-gray-400">No skills added yet. Add some skills to showcase your expertise!</p>
                   </div>
                 )}
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex justify-end space-x-4 pt-8 border-t border-gray-600">
               <button
                 type="button"
                 onClick={() => setIsEditing(false)}
                 className="bg-gray-700 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-lg"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={saving}
                 className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg flex items-center"
               >
                 {saving ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     Saving Changes...
                   </>
                 ) : (
                   <>
                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                     Save Changes
                   </>
                 )}
               </button>
             </div>
                </form>
              </div>
            )}

      {/* My Projects Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">My Projects</h2>
          <Link href="/projects/create" className="btn-primary">
            Create New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">You haven't created any projects yet.</p>
            <Link href="/projects/create" className="btn-primary">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-gray-700 border border-gray-600 rounded-lg p-6 hover:bg-gray-650 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      <Link href={`/projects/${project._id}`} className="hover:text-green-400">
                        {project.title}
                      </Link>
                    </h3>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  {project.lookingForTeammates && (
                    <span className="bg-green-800 text-green-200 text-xs px-2 py-1 rounded-full ml-2">
                      Seeking Team
                    </span>
                  )}
                </div>

                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.techStack.slice(0, 3).map((tech, index) => (
                      <span key={index} className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-gray-400 text-xs">+{project.techStack.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>❤️ {project.likes?.length || 0}</span>
                    <span>💬 {project.comments?.length || 0}</span>
                  </div>
                   <div className="flex space-x-2">
                     <Link href={`/projects/${project._id}`} className="text-green-400 hover:text-green-300">
                       View & Edit
                     </Link>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
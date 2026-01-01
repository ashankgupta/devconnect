import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, fetchUnreadCount } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationMessage, setCollaborationMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    demoLink: '',
    lookingForTeammates: false,
    tags: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deleteLoading, setDeleteLoading] = useState(false);
   const [showLeaveModal, setShowLeaveModal] = useState(false);
   const [leaveLoading, setLeaveLoading] = useState(false);
   const [showUpdateModal, setShowUpdateModal] = useState(false);
   const [updateForm, setUpdateForm] = useState({
     title: '',
     content: '',
     type: 'status'
   });
   const [projectUpdates, setProjectUpdates] = useState([]);
   const [expandedComments, setExpandedComments] = useState({});
   const [commentTexts, setCommentTexts] = useState({});
   const [loadingComments, setLoadingComments] = useState({});
   const [handlingRequest, setHandlingRequest] = useState(null);

   // Computed values (moved before useEffect to avoid temporal dead zone)
   const isOwner = user && project?.owner?._id === user._id;
   const isTeamMember = project?.teamMembers?.some(member => member.user._id === user?._id);
   const hasPendingRequest = project?.collaborationRequests?.some(req => req.user._id === user?._id && req.status === 'pending');
   const hasAcceptedRequest = project?.collaborationRequests?.some(req => req.user._id === user?._id && req.status === 'accepted');
   const canEditProject = isOwner || isTeamMember;

   useEffect(() => {
     if (id) {
       fetchProject();
     }
   }, [id]);

   useEffect(() => {
     if (isTeamMember && id) {
       fetchProjectUpdates();
     }
   }, [project, user, id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      setProject(data);
      setIsLiked(data.likes?.some(like => like.user === user?._id) || false);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      await fetch(`/api/projects/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIsLiked(!isLiked);
      // Refresh project data
      fetchProject();
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: comment })
      });
      setComment('');
      fetchProject();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCollaborationRequest = async (e) => {
    e.preventDefault();
    if (!user || !collaborationMessage.trim()) return;

    try {
      const response = await fetch(`/api/projects/${id}/collaborate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: collaborationMessage })
      });

      if (response.ok) {
        setShowCollaborationModal(false);
        setCollaborationMessage('');
        alert('Collaboration request sent!');
        fetchProject(); // Refresh to update the UI state
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      alert('Error sending collaboration request. Please try again.');
    }
  };

  const openEditModal = () => {
    setEditFormData({
      title: project.title,
      description: project.description,
      techStack: project.techStack ? project.techStack.join(', ') : '',
      githubLink: project.githubLink || '',
      demoLink: project.demoLink || '',
      lookingForTeammates: project.lookingForTeammates || false,
      tags: project.tags ? project.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    // Client-side validation
    if (editFormData.githubLink && !/^https?:\/\/github\.com\/.+/.test(editFormData.githubLink)) {
      setEditError('Please enter a valid GitHub URL');
      return;
    }

    setEditLoading(true);

    try {
      const projectData = {
        ...editFormData,
        techStack: editFormData.techStack.split(',').map(tech => tech.trim()).filter(tech => tech),
        tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchProject(); // Refresh the project data
      } else {
        const error = await response.json();
        setEditError(error.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setEditError('Failed to update project. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

   const handleDeleteProject = async () => {
     setDeleteLoading(true);
     try {
       const response = await fetch(`/api/projects/${id}`, {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });

       if (response.ok) {
         alert('Project deleted successfully');
         router.push('/projects');
       } else {
         const error = await response.json();
         alert(`Error deleting project: ${error.message || 'Unknown error'}`);
       }
     } catch (error) {
       console.error('Error deleting project:', error);
       alert('Error deleting project');
     } finally {
       setDeleteLoading(false);
     }
   };

   const handleLeaveProject = async () => {
     setLeaveLoading(true);
     try {
       const response = await fetch(`/api/projects/${id}/leave`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });

       if (response.ok) {
         alert('You have left the project');
         router.push('/projects');
       } else {
         const error = await response.json();
         alert(`Error leaving project: ${error.message || 'Unknown error'}`);
       }
     } catch (error) {
       console.error('Error leaving project:', error);
       alert('Error leaving project');
     } finally {
       setLeaveLoading(false);
     }
   };

  // Fetch project updates
  const fetchProjectUpdates = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/updates`);
      if (response.ok) {
        const data = await response.json();
        setProjectUpdates(data.updates);
      }
    } catch (error) {
      console.error('Error fetching project updates:', error);
    }
  };

  // Handle creating new update
  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.title.trim() || !updateForm.content.trim()) return;

    try {
      const response = await fetch(`/api/projects/${id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateForm)
      });

      if (response.ok) {
        setShowUpdateModal(false);
        setUpdateForm({ title: '', content: '', type: 'status' });
        fetchProjectUpdates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating update:', error);
      alert('Error creating project update');
    }
  };

  // Handle liking update
  const handleUpdateLike = async (updateId) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/projects/${id}/updates/${updateId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchProjectUpdates(); // Refresh to update like counts
      }
    } catch (error) {
      console.error('Error liking update:', error);
    }
  };

  // Handle adding comment
  const handleAddComment = async (updateId) => {
    const content = commentTexts[updateId]?.trim();
    if (!content) return;

    setLoadingComments(prev => ({ ...prev, [updateId]: true }));

    try {
      const response = await fetch(`/api/projects/${id}/updates/${updateId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        setCommentTexts(prev => ({ ...prev, [updateId]: '' }));
        fetchProjectUpdates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    } finally {
      setLoadingComments(prev => ({ ...prev, [updateId]: false }));
    }
  };

  // Handle deleting update
  const handleDeleteUpdate = async (updateId) => {
    if (!confirm('Are you sure you want to delete this update?')) return;

    try {
      const response = await fetch(`/api/projects/${id}/updates/${updateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchProjectUpdates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting update:', error);
      alert('Error deleting update');
    }
  };

  // Toggle comments visibility
  const toggleComments = (updateId) => {
    setExpandedComments(prev => ({
      ...prev,
      [updateId]: !prev[updateId]
    }));
  };

  const handleCollaborationRequestAction = async (requestId, action) => {
    setHandlingRequest(requestId);
    try {
      const response = await fetch(`/api/projects/${id}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        alert(`Collaboration request ${action}ed successfully`);
        fetchProject(); // Refresh to update the requests list
        fetchUnreadCount(); // Refresh notification count
      } else {
        const error = await response.json();
        alert(`Error ${action}ing request: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing collaboration request:`, error);
      alert(`Error ${action}ing collaboration request`);
    } finally {
      setHandlingRequest(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading project...</div>;
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>;
  }



  return (
    <div className="max-w-4xl mx-auto">
      {/* Project Header */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">{project.title}</h1>
            <div className="flex items-center space-x-4 text-gray-400 mb-4">
              <Link href={`/profile/${project.owner._id}`} className="flex items-center space-x-2 hover:text-blue-600">
                <img
                  src={project.owner.profilePicture || '/default-avatar.png'}
                  alt={project.owner.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{project.owner.name}</span>
              </Link>
              <span>•</span>
              <span>{project.owner.branch} {project.owner.year}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{project.teamMembers?.length || 1} member{project.teamMembers?.length !== 1 ? 's' : ''}</span>
              </span>
              <span>•</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {project.lookingForTeammates && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              Looking for Teammates
            </span>
          )}
        </div>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech, index) => (
              <span key={index} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {tech}
              </span>
            ))}
        </div>
      )}

        {/* Description */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-4 mb-6">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 flex items-center space-x-2"
            >
              <span>🔗</span>
              <span>GitHub Repository</span>
            </a>
          )}
          {project.demoLink && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 flex items-center space-x-2"
            >
              <span>🌐</span>
              <span>Live Demo</span>
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isLiked ? 'bg-red-800 text-red-200' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <span>❤️</span>
                <span>{project.likes?.length || 0}</span>
              </button>

              {!isOwner && !(isTeamMember || hasAcceptedRequest) && project.lookingForTeammates && !hasPendingRequest && (
                <button
                  onClick={() => setShowCollaborationModal(true)}
                  className="btn-primary"
                >
                  Join Team
                </button>
              )}

              {hasPendingRequest && (
                <span className="text-yellow-600 bg-yellow-100 px-3 py-2 rounded-lg">
                  Request Pending
                </span>
              )}

              {(isTeamMember || hasAcceptedRequest) && (
                <span className="text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                  Team Member
                </span>
              )}
            </>
          )}

           {canEditProject && (
             <button onClick={openEditModal} className="btn-secondary">
               Edit Project
             </button>
           )}

           {isTeamMember && !isOwner && (
             <button
               onClick={() => setShowLeaveModal(true)}
               className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
             >
               Leave Project
             </button>
           )}

           {isOwner && (
             <button
               onClick={() => setShowDeleteModal(true)}
               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
             >
               Delete Project
             </button>
           )}
        </div>
      </div>

      {/* Collaboration Requests Section (for project owner) */}
      {isOwner && project.collaborationRequests && project.collaborationRequests.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="text-blue-400 mr-2">🤝</span>
            Collaboration Requests ({project.collaborationRequests.filter(req => req.status === 'pending').length})
          </h3>

          <div className="space-y-4">
            {project.collaborationRequests
              .filter(request => request.status === 'pending')
              .map((request) => (
                <div key={request._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={request.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user.name)}&background=ea580c&color=ffffff&size=32`}
                          alt={request.user.name}
                          className="w-8 h-8 rounded-full border-2 border-orange-500"
                        />
                        <div>
                          <span className="font-medium text-white">{request.user.name}</span>
                          <span className="text-sm text-gray-400 ml-2">
                            {request.user.branch} {request.user.year}
                          </span>
                        </div>
                      </div>
                      {request.message && (
                        <p className="text-gray-300 text-sm mb-3 italic">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleCollaborationRequestAction(request._id, 'accept')}
                        disabled={handlingRequest === request._id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        {handlingRequest === request._id ? '...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleCollaborationRequestAction(request._id, 'reject')}
                        disabled={handlingRequest === request._id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        {handlingRequest === request._id ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {project.collaborationRequests.filter(req => req.status !== 'pending').length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-600">
              <h4 className="text-lg font-medium text-white mb-3">Previous Requests</h4>
              <div className="space-y-2">
                {project.collaborationRequests
                  .filter(request => request.status !== 'pending')
                  .slice(-5) // Show last 5
                  .map((request) => (
                    <div key={request._id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300">{request.user.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === 'accepted'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Members Section */}
      {project.teamMembers && project.teamMembers.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="text-blue-400 mr-2">👥</span>
            Team Members ({project.teamMembers.length})
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.teamMembers.map((member) => (
              <div key={member.user._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=4B5563&color=FFFFFF&size=40`}
                    alt={member.user.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium truncate">{member.user.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        member.role === 'Owner'
                          ? 'bg-purple-900 text-purple-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {member.user.branch} {member.user.year}
                    </p>
                    {member.user.skills && member.user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.user.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {member.user.skills.length > 3 && (
                          <span className="text-gray-500 text-xs">+{member.user.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Updates Section */}
      {isTeamMember && (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <span className="text-green-400 mr-2">📢</span>
              Project Updates
            </h3>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Post Update
            </button>
          </div>

          <div className="space-y-4">
            {projectUpdates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-400">No project updates yet!</p>
                <p className="text-gray-500 text-sm mt-2">
                  Team members can post status updates, milestones, and announcements here.
                </p>
              </div>
            ) : (
              projectUpdates.map((update) => (
                <div key={update._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={update.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(update.author?.name || 'User')}&background=4B5563&color=FFFFFF&size=32`}
                        alt={update.author?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{update.author?.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            update.type === 'milestone' ? 'bg-yellow-900 text-yellow-300' :
                            update.type === 'announcement' ? 'bg-blue-900 text-blue-300' :
                            update.type === 'discussion' ? 'bg-purple-900 text-purple-300' :
                            'bg-green-900 text-green-300'
                          }`}>
                            {update.type}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(update.createdAt).toLocaleDateString()} at {new Date(update.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {update.isPinned && (
                      <span className="text-yellow-400 text-sm">📌 Pinned</span>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-white mb-2">{update.title}</h4>
                  <p className="text-gray-300 mb-4 whitespace-pre-line">{update.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleUpdateLike(update._id)}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          update.likes?.some(like => like.user === user?._id)
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <span>❤️</span>
                        <span>{update.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(update._id)}
                        className="flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <span>💬</span>
                        <span>{update.comments?.length || 0}</span>
                      </button>
                    </div>
                    {(canEditProject || update.author?._id === user?._id) && (
                      <button
                        onClick={() => handleDeleteUpdate(update._id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {expandedComments[update._id] && (
                    <div className="mt-4 border-t border-gray-600 pt-4">
                      <div className="space-y-3 mb-4">
                        {update.comments?.map((comment, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <img
                              src={comment.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=4B5563&color=FFFFFF&size=24`}
                              alt={comment.user?.name}
                              className="w-6 h-6 rounded-full mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-white font-medium text-sm">{comment.user?.name}</span>
                                <span className="text-gray-400 text-xs">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {user && (
                        <div className="flex items-start space-x-3">
                          <img
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4B5563&color=FFFFFF&size=24`}
                            alt={user.name}
                            className="w-6 h-6 rounded-full mt-1"
                          />
                          <div className="flex-1">
                            <textarea
                              value={commentTexts[update._id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [update._id]: e.target.value }))}
                              placeholder="Add a comment..."
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleAddComment(update._id)}
                                disabled={!commentTexts[update._id]?.trim() || loadingComments[update._id]}
                                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                              >
                                {loadingComments[update._id] ? 'Posting...' : 'Comment'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Leave Project Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-xl font-semibold text-white mb-4">Leave Project</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to leave "{project?.title}"? You will lose access to team features.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1"
                  disabled={leaveLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveProject}
                  disabled={leaveLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-4 py-2 rounded-lg flex-1 font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {leaveLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Leaving...</span>
                    </div>
                  ) : (
                    'Leave Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Post Project Update</h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Update Type
                  </label>
                  <select
                    value={updateForm.type}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="status">Status Update</option>
                    <option value="milestone">Milestone</option>
                    <option value="announcement">Announcement</option>
                    <option value="discussion">Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief title for your update"
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{updateForm.title.length}/200 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={updateForm.content}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={6}
                    placeholder="Share your project update, progress, or announcement..."
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{updateForm.content.length}/2000 characters</p>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Post Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠</div>
              <h3 className="text-xl font-semibold text-white mb-4">Delete Project</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{project?.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg flex-1 font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Join the Team</h3>
            <form onSubmit={handleCollaborationRequest}>
              <textarea
                value={collaborationMessage}
                onChange={(e) => setCollaborationMessage(e.target.value)}
                placeholder="Tell us why you'd like to join this project..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
                rows={4}
                required
              />
              <div className="flex space-x-3">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowCollaborationModal(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Edit Project</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {editError && (
                <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-200">{editError}</p>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your project title"
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{editFormData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={6}
                    placeholder="Describe your project in detail..."
                    required
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{editFormData.description.length}/1000 characters</p>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    name="techStack"
                    value={editFormData.techStack}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      value={editFormData.githubLink}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      value={editFormData.demoLink}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    value={editFormData.tags}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="web-development, mobile-app, ai, etc. (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Help others find your project</p>
                </div>

                {/* Looking for Teammates */}
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <input
                    type="checkbox"
                    id="edit-lookingForTeammates"
                    name="lookingForTeammates"
                    checked={editFormData.lookingForTeammates}
                    onChange={handleEditChange}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
                  />
                  <div>
                    <label htmlFor="edit-lookingForTeammates" className="text-gray-200 font-medium cursor-pointer">
                      Looking for teammates
                    </label>
                    <p className="text-sm text-gray-400">Let others know you're open to collaboration</p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {editLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Project'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
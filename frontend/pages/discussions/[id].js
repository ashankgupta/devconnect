import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

// CommentThread component for nested comments
const CommentThread = ({
  comment,
  discussionId,
  user,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleReply,
  expandedComments,
  toggleCommentExpansion,
  level = 0
}) => {
  const isExpanded = expandedComments.has(comment._id);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxIndentation = 3; // Maximum indentation level
  const currentLevel = Math.min(level, maxIndentation);

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-600 pl-4' : ''}`}>
      <div className="flex space-x-3">
        <img
          src={comment.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=ea580c&color=ffffff&size=32`}
          alt={comment.user.name}
          className="w-8 h-8 rounded-full border-2 border-orange-500 flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link href={`/profile/${comment.user._id}`} className="font-medium text-gray-200 hover:text-orange-400 transition-colors">
              {comment.user.name}
            </Link>
            <span className="text-gray-500 text-sm">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {level === 0 && (
              <span className="text-xs bg-orange-900 text-orange-200 px-2 py-1 rounded-full">
                OP
              </span>
            )}
          </div>

          <p className="text-gray-300 mb-3 leading-relaxed">{comment.content}</p>

          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="text-gray-400 hover:text-orange-400 transition-colors flex items-center space-x-1"
            >
              <span>💬</span>
              <span>Reply</span>
            </button>

            {hasReplies && (
              <button
                onClick={() => toggleCommentExpansion(comment._id)}
                className="text-gray-400 hover:text-orange-400 transition-colors flex items-center space-x-1"
              >
                <span>{isExpanded ? '▼' : '▶'}</span>
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && user && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex space-x-3">
                <img
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ea580c&color=ffffff&size=32`}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-orange-500 flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user.name}...`}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="text-gray-400 hover:text-white text-sm px-3 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(comment._id, replyText)}
                      disabled={!replyText.trim()}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && (isExpanded || level === 0) && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply._id}
                  comment={reply}
                  discussionId={discussionId}
                  user={user}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handleReply={handleReply}
                  expandedComments={expandedComments}
                  toggleCommentExpansion={toggleCommentExpansion}
                  level={currentLevel + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DiscussionDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());

  useEffect(() => {
    if (id) {
      fetchDiscussion();
    }
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const response = await fetch(`/api/discussions/${id}`);
      const data = await response.json();
      setDiscussion(data);
      setIsLiked(data.likes?.some(like => like.user === user?._id) || false);
    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/discussions/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        setDiscussion(prev => ({
          ...prev,
          likes: isLiked
            ? prev.likes.filter(like => like.user !== user._id)
            : [...prev.likes, { user: user._id }]
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      const response = await fetch(`/api/discussions/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: comment.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussion(prev => ({
          ...prev,
          comments: [...prev.comments, data.comment]
        }));
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Helper function to recursively add reply to nested comments
  const addReplyToComment = (comments, targetCommentId, newReply) => {
    return comments.map(comment => {
      const commentId = typeof comment._id === 'string' ? comment._id : comment._id.toString();
      const targetId = typeof targetCommentId === 'string' ? targetCommentId : targetCommentId.toString();

      if (commentId === targetId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, targetCommentId, newReply)
        };
      }
      return comment;
    });
  };

  const handleReply = async (commentId, replyContent) => {
    if (!user || !replyContent.trim()) return;

    try {
      const response = await fetch(`/api/discussions/${id}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: replyContent.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussion(prev => ({
          ...prev,
          comments: addReplyToComment(prev.comments, commentId, data.reply)
        }));
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleDeleteDiscussion = async () => {
    if (!confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/discussions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Discussion deleted successfully');
        router.push('/discussions'); // Redirect to discussions list
      } else {
        const error = await response.json();
        alert(`Error deleting discussion: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Error deleting discussion');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-8xl mb-6">❌</div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Discussion Not Found</h2>
          <p className="text-gray-500 mb-6">The discussion you're looking for doesn't exist or has been removed.</p>
          <Link href="/discussions" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            Back to Discussions
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
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Discussion</h1>
        </div>
      </div>

      {/* Discussion Content */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-bold text-white hover:text-orange-400 transition-colors">
                {discussion.title}
              </h2>
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
            <div className="flex items-center space-x-4 text-gray-400 text-sm mb-4">
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

        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-gray-300 whitespace-pre-line text-lg leading-relaxed">{discussion.content}</p>
        </div>

        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {discussion.tags.map((tag, index) => (
              <span key={index} className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full border border-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-orange-400'
              }`}
            >
              <span>❤️</span>
              <span>{discussion.likes?.length || 0}</span>
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-blue-400">💬</span>
              <span>{discussion.comments?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-400">👁️</span>
              <span>{discussion.viewCount || 0}</span>
            </div>
          </div>
          {user && discussion.author && user._id === discussion.author._id && (
            <button
              onClick={handleDeleteDiscussion}
              className="bg-red-800 text-red-300 px-4 py-2 rounded-lg hover:bg-red-700 hover:text-red-200 transition-colors text-sm font-medium border border-red-600"
              title="Delete this discussion (only available to creator)"
            >
              🗑️ Delete Discussion
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="text-orange-400 mr-2">💬</span>
          Comments ({discussion.comments?.length || 0})
        </h3>

        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex space-x-3">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ea580c&color=ffffff&size=40`}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-orange-500"
              />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 mb-8 bg-gray-700 rounded-lg border border-gray-600">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-300 mb-4">Join the conversation</p>
            <Link href="/login" className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block">
              Sign In to Comment
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {discussion.comments?.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              discussionId={id}
              user={user}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReply={handleReply}
              expandedComments={expandedComments}
              toggleCommentExpansion={toggleCommentExpansion}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
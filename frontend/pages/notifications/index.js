import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import axios from 'axios';

const NotificationsPage = () => {
  const { user, notifications, fetchNotifications, markAsRead, markAllAsRead } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications?page=${page}&limit=20`);
      if (page === 1) {
        // Replace notifications for first page
        // Note: This is a simplified approach. In a real app, you'd want to append or handle pagination properly
        fetchNotifications();
      }
      setHasMore(response.data.notifications.length === 20);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Please log in to view notifications</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.293-4.293L15 6.414V17z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors ${
                  !notification.isRead ? 'border-l-4 border-l-green-400' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={notification.sender?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender?.name || 'User')}&background=4B5563&color=FFFFFF&size=40`}
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                      <span className="text-sm text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 mt-2">{notification.message}</p>
                    {notification.relatedProject && (
                      <div className="mt-3">
                        <a
                          href={`/projects/${notification.relatedProject._id}`}
                          className="text-green-400 hover:text-green-300 text-sm font-medium"
                        >
                          View Project: {notification.relatedProject.title}
                        </a>
                      </div>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="mt-3 text-sm text-green-400 hover:text-green-300 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
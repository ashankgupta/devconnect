import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authTrigger, setAuthTrigger] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          // Set axios default headers for authenticated requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

           // Fetch full user data from API
           const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/profile`);
           if (response.status === 200) {
             const userData = response.data;
             setUser(userData);
             // Fetch notifications for authenticated user
             fetchNotifications();
             fetchUnreadCount();
           } else {
             // Token is invalid, remove it
             localStorage.removeItem('token');
             delete axios.defaults.headers.common['Authorization'];
             setUser(null);
           }
        } else {
          // Token expired
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear any corrupted data
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, [authTrigger]);

  // Poll for unread count updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Function to trigger auth re-initialization
  const refreshAuth = () => {
    setAuthTrigger(prev => prev + 1);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count`);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-all-read`);
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch notifications for new login
      fetchNotifications();
      fetchUnreadCount();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch notifications for new registration
      fetchNotifications();
      fetchUnreadCount();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setNotifications([]);
    setUnreadCount(0);
  };

  const updateProfile = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('Updating profile with:', updates);
      console.log('Using token:', token.substring(0, 20) + '...');

      const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/profile`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile update response:', response.data);

      if (response.data.user) {
        setUser(response.data.user);
      }
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
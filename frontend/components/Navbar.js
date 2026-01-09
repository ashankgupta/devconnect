import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800 md:hidden transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-xl font-mono font-bold text-white">DevConnect</span>
            </Link>
          </div>



           <div className="hidden md:flex items-center space-x-4">
             <Link href="/projects" className="flex items-center space-x-1 text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
               </svg>
               <span>Projects</span>
             </Link>
             <Link href="/communities" className="flex items-center space-x-1 text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
               <span>Communities</span>
             </Link>
             <Link href="/discussions" className="flex items-center space-x-1 text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
               <span>Discussions</span>
             </Link>
            <Link href="/events" className="flex items-center space-x-1 text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Events</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
             ) : user ? (
               <div className="flex items-center space-x-3">
                 <NotificationDropdown />
                  <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
                     <img
                       className="h-8 w-8 rounded-full object-cover"
                       src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4B5563&color=FFFFFF&size=32`}
                       onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4B5563&color=FFFFFF&size=32`; }}
                       alt=""
                     />
                    <span className="hidden sm:block text-sm font-medium text-gray-300">{user.name}</span>
                  </Link>
                 {user.isAdmin && (
                   <Link href="/admin" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                     Admin
                   </Link>
                 )}
                 <button
                   onClick={logout}
                   className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                 >
                   Logout
                 </button>
               </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-green-600 text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
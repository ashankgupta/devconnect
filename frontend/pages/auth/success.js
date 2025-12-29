import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthSuccess() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
          // Store the token
          localStorage.setItem('token', token);

          // Trigger auth refresh to load user data
          refreshAuth();

          // Clean up URL by removing token from URL
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          // Show success message and redirect
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          // No token received, redirect to login with error
          router.push('/login?error=auth_failed');
        }
      } catch (error) {
        console.error('Auth success error:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleAuthSuccess();
  }, [router, refreshAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Successfully signed in!
        </h2>
        <p className="text-gray-300 mb-4">
          Welcome to DevConnect. Redirecting you to the dashboard...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
      </div>
    </div>
  );
}
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AuthError() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Authentication Failed
        </h1>
        <p className="text-gray-300 mb-6">
          There was an error signing you in with Google. This might be due to:
        </p>
        <ul className="text-left text-gray-300 mb-6 space-y-2">
          <li>• Google OAuth not properly configured</li>
          <li>• Network connectivity issues</li>
          <li>• Invalid or expired authentication request</li>
        </ul>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full btn-primary text-center"
          >
            Try Again
          </Link>
          <p className="text-sm text-gray-400">
            Redirecting to login page in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
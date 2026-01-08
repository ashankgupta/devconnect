import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to DevConnect</h1>
        <p className="text-xl mb-6">
          Connect, collaborate, and showcase your projects with fellow developers in your college community.
        </p>
        {!user && (
          <div className="space-x-4">
            <Link href="/register" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
              Get Started
            </Link>
            <Link href="/login" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl mb-4">💻</div>
          <h3 className="text-xl font-semibold mb-2 text-green-400">Showcase Projects</h3>
          <p className="text-gray-300">
            Upload your projects, get feedback, and find collaborators for your next big idea.
          </p>
        </div>

        <div className="card">
          <div className="text-3xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2 text-green-400">Find Teammates</h3>
          <p className="text-gray-300">
            Connect with students who share your interests and work together on exciting projects.
          </p>
        </div>

        <div className="card">
          <div className="text-3xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2 text-green-400">Tech Discussions</h3>
          <p className="text-gray-300">
            Engage in meaningful conversations about technology, share knowledge, and learn together.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      {user && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/projects/create" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-500 transition-colors">
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold">Create Project</div>
            </Link>
            <Link href="/projects" className="bg-gray-700 text-white p-4 rounded-lg text-center hover:bg-gray-600 transition-colors">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold">Browse Projects</div>
            </Link>
            <Link href="/discussions/create" className="bg-gray-700 text-white p-4 rounded-lg text-center hover:bg-gray-600 transition-colors">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold">Start Discussion</div>
            </Link>
            <Link href="/events" className="bg-gray-700 text-white p-4 rounded-lg text-center hover:bg-gray-600 transition-colors">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold">View Events</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
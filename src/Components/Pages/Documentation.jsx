import { Link } from 'react-router-dom';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Documentation</h1>
        <div className="prose prose-indigo max-w-none">
          <p>Welcome to the NetworkDash documentation.</p>
          <p>This page is a placeholder. You would fill this with detailed information about how to use your application, API endpoints, and configuration guides.</p>
        </div>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
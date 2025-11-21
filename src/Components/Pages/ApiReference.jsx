import { Link } from 'react-router-dom';

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">API Reference</h1>
        <div className="prose prose-indigo max-w-none">
          <p>This page is a placeholder for your API Reference.</p>
          <p>Here you would list all available API endpoints, request parameters, and example responses.</p>
          <pre>{`GET /api/devices\nPOST /api/devices\n...`}</pre>
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
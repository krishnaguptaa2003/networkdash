import { Link } from 'react-router-dom';

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tutorials</h1>
        <div className="prose prose-indigo max-w-none">
          <p>This page is a placeholder for your tutorials.</p>
          <p>You could add step-by-step guides and videos here, such as:</p>
          <ul>
            <li>How to add your first device</li>
            <li>Setting up automated reports</li>
            <li>Configuring alerts</li>
          </ul>
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
import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <div className="prose prose-indigo max-w-none">
          <p>This is the Cookie Policy for NetworkDash, accessible from networkdash.netlify.app</p>
          <h2>What Are Cookies</h2>
          <p>As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.</p>
          <p>This is a placeholder document. You must replace this with your own policy.</p>
        </div>
        <div className="mt-8">
          <Link
            to="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
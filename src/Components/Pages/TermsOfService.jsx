import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <div className="prose prose-indigo max-w-none">
                    <p>Welcome to NetworkDash!</p>
                    <p>
                        These terms and conditions outline the rules and regulations for the use of
                        NetworkDash's Website, located at networkdash.netlify.app.
                    </p>
                    <p>
                        By accessing this website we assume you accept these terms and conditions. Do not
                        continue to use NetworkDash if you do not agree to take all of the terms and
                        conditions stated on this page.
                    </p>

                    <h2>Cookies</h2>
                    <p>
                        We employ the use of cookies. By accessing NetworkDash, you agreed to use
                        cookies in agreement with the NetworkDash's Privacy Policy.
                    </p>

                    <h2>License</h2>
                    <p>
                        Unless otherwise stated, NetworkDash and/or its licensors own the
                        intellectual property rights for all material on NetworkDash. All
                        intellectual property rights are reserved. You may access this from
                        NetworkDash for your own personal use subjected to restrictions set in these
                        terms and conditions.
                    </p>

                    <p>This is a placeholder document. You must replace this with your own terms.</p>
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
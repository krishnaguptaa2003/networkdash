import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <div className="prose prose-indigo max-w-none">
                    <p>
                        Your privacy is important to us. It is NetworkDash's policy to respect
                        your privacy regarding any information we may collect from you across our
                        website, https://networkdash.netlify.app.
                    </p>
                    <p>
                        We only ask for personal information when we truly need it to provide a
                        service to you. We collect it by fair and lawful means, with your
                        knowledge and consent. We also let you know why we’re collecting it and
                        how it will be used.
                    </p>
                    <p>
                        We only retain collected information for as long as necessary to provide
                        you with your requested service. What data we store, we’ll protect within
                        commercially acceptable means to prevent loss and theft, as well as
                        unauthorized access, disclosure, copying, use or modification.
                    </p>
                    <p>
                        We don’t share any personally identifying information publicly or with
                        third-parties, except when required to by law.
                    </p>
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
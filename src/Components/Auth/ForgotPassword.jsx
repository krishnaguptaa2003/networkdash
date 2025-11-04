// D:\Github\networkdash\src\Components\Auth\ForgotPassword.jsx
// **** THIS IS THE CORRECTED FILE ****

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- IMPORT useNavigate
import { FaEnvelope, FaArrowLeft, FaCheck } from 'react-icons/fa';
import AuthFormInput from './AuthFormInput';

const ForgotPassword = () => { // <--- REMOVE onNavigate
  const navigate = useNavigate(); // <--- ADD this
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // --- THIS IS THE NEW FETCH CALL ---
      const response = await fetch('/.netlify/functions/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }
      // --- END OF NEW FETCH CALL ---

      setIsSubmitted(true); // Show the "Check your email" message
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-24 mx-auto max-w-7xl">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="px-6 py-6 sm:px-8 sm:py-6">
            <button
              onClick={() => navigate('/login')} // <--- USE navigate
              className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 transition-colors text-sm sm:text-base"
            >
              <FaArrowLeft className="mr-2" /> Back to login
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {isSubmitted ? 'Check your email' : 'Reset your password'}
              </h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                {isSubmitted 
                  ? `We've sent instructions to ${email}`
                  : 'Enter your email to receive a reset link'}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <AuthFormInput
                  id="forgot-email"
                  label="Email Address"
                  type="email"
                  icon={<FaEnvelope className="text-gray-400" />}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FaCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  If you don't see the email, check your spam folder.
                </p>
                <button
                  onClick={handleSubmit} // Resend email
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors text-sm sm:text-base"
                >
                  Resend email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
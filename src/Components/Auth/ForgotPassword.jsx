import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheck } from 'react-icons/fa';
import AuthFormInput from './AuthFormInput';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage(''); // Clear previous messages

    try {
      const response = await fetch('/.netlify/functions/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (!response.ok) {
        // --- THIS IS THE NEW PART ---
        // We check for the 429 "Too Many Requests" error
        if (response.status === 429) {
          // Show a friendly error instead of the scary one
          setError('A reset link has already been sent. Please check your email.');
        } else {
          throw new Error(data.error || 'Failed to send reset link');
        }
        // --- END OF NEW PART ---
      } else {
        setIsSubmitted(true); // Show the "Check your email" screen
        setSuccessMessage(`We've sent instructions to ${email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // This function is just for the "Resend" button
  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/.netlify/functions/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Show the specific error message you wanted!
          setError('A reset link has already been sent. Please check your spam folder or try again in 30 minutes.');
        } else {
          throw new Error(data.error || 'Failed to send reset link');
        }
      } else {
        // Just show a success message
        setSuccessMessage('A new link has been sent.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-24 mx-auto max-w-7xl">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="px-6 py-6 sm:px-8 sm:py-6">
            <button
              onClick={() => navigate('/login')}
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
                  ? successMessage
                  : 'Enter your email to receive a reset link'}
              </p>
            </div>
            
            {/* --- ERROR AND SUCCESS MESSAGES --- */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {successMessage && !isSubmitted && (
               <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}
            {/* --- END OF MESSAGES --- */}


            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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
                  onClick={handleResend} // <-- Use the new resend function
                  disabled={isLoading}
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors text-sm sm:text-base disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend email'}
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

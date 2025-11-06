import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email from the Signup page or Login page
  const [email, setEmail] = useState(location.state?.email || '');
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // If there's no email, we can't verify. Send user to login.
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // --- Success! ---
      // Save the token and user, just like in Login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Show the success message
      setIsVerified(true);

      // After 3 seconds, send to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP input fields
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp.split('')];
    newOtp[index] = value;
    setOtp(newOtp.join(''));

    // Move to next input
    if (value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-24 mx-auto max-w-7xl">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="px-6 py-6 sm:px-8 sm:py-6">
            {!isVerified ? (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 text-sm sm:text-base"
                >
                  <FaArrowLeft className="mr-2" /> Back to Sign Up
                </button>
                
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Verify Your Email</h2>
                  <p className="text-gray-500 mt-1 text-sm sm:text-base">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[...Array(6)].map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={otp[index] || ''}
                        onChange={(e) => handleOtpChange(e, index)}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className={`w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm sm:text-base transition-opacity ${
                      (isLoading || otp.length < 6) ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>
                
                <div className="text-center mt-4">
                  <button
                    // We will add this feature next
                    // onClick={handleResendOtp}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FaCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Success! You will be redirected to the dashboard shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

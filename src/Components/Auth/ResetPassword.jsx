// D:\Github\networkdash\src\Components\Auth\ResetPassword.jsx
// **** THIS IS A NEW FILE. CREATE IT. ****

import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import AuthFormInput from './AuthFormInput';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Gets token from URL like ?token=...

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/forgot-password', {
        method: 'PUT', // Use PUT to update the password
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, newPassword: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true); // Show success message
    } catch (err) {
      setError(err.message);
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
            
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FaCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Your password has been successfully updated.
                </p>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Set New Password</h2>
                  <p className="text-gray-500 mt-1 text-sm sm:text-base">
                    Please enter your new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  {!token && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                      <p className="text-sm text-yellow-700">No reset token found in URL.</p>
                    </div>
                  )}

                  <AuthFormInput
                    id="password"
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    icon={<FaLock className="text-gray-400" />}
                    showToggle
                    onToggle={() => setShowPassword(!showPassword)}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <AuthFormInput
                    id="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    icon={<FaLock className="text-gray-400" />}
                    showToggle
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token && user) {
      // Save the token and user data from the URL
      localStorage.setItem('token', token);
      localStorage.setItem('user', decodeURIComponent(user));
      
      // Send them to the dashboard
      navigate('/dashboard');
    } else {
      // Something went wrong, send them to login
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate]);

  // Show a simple loading message
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Logging you in...</h2>
        <p className="text-gray-600">Please wait, we're securely logging you in.</p>
        {/* You could add a spinner here */}
      </div>
    </div>
  );
};

export default AuthCallback;

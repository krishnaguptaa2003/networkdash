import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check for the token in local storage
    const token = localStorage.getItem('token');
    
    if (token) {
      // If token exists, redirect to dashboard (user is already logged in)
      navigate('/dashboard');
    } else {
      // If no token, allow access to public routes
      setIsChecked(true);
    }
  }, [navigate]);

  // Show loading while checking authentication
  if (!isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Only render children if user is not authenticated
  return children;
};

export default PublicRoute;
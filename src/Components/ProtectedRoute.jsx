import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  // We use state to know if we are done checking
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for the token in local storage
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token, send to login
      navigate('/login');
    } else {
      // If token EXISTS, we are authenticated!
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // --- This is the fix ---
  // If we are not authenticated yet, just show a loading message
  // and NOT the dashboard.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Only if isAuthenticated is true, show the children (the dashboard)
  return children;
};

export default ProtectedRoute;

// D:\Github\networkdash\src\App.jsx
// **** THIS IS THE UPDATED FILE ****

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './Components/Auth/Login';
import Signup from './Components/Auth/Signup';
import VerifyEmail from './Components/Auth/VerifyEmail';
import ForgotPassword from './Components/Auth/ForgotPassword';
import ResetPassword from './Components/Auth/ResetPassword';
import AuthCallback from './Components/Auth/AuthCallback';
import Dashboard from './Components/Pages/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';

// This is the auth layout wrapper
const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    {children}
  </div>
);

// Define the application routes
const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthLayout><Login /></AuthLayout>,
  },
  {
    path: "/signup",
    element: <AuthLayout><Signup /></AuthLayout>,
  },
  {
    path: "/verify-email",
    element: <AuthLayout><VerifyEmail /></AuthLayout>,
  },
  {
    path: "/forgot-password",
    element: <AuthLayout><ForgotPassword /></AuthLayout>,
  },
  {
    path: "/reset-password",
    element: <AuthLayout><ResetPassword /></AuthLayout>,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    // Default route: redirect to login
    path: "/",
    element: <Navigate to="/login" replace />,
  }
]);

function App() {
  // The RouterProvider handles everything
  return <RouterProvider router={router} />;
}

export default App;
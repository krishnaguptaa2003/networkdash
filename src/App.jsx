// D:\Github\networkdash\src\App.jsx
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Login from './Components/Auth/Login';
import Signup from './Components/Auth/Signup';
import VerifyEmail from './Components/Auth/VerifyEmail';
import ForgotPassword from './Components/Auth/ForgotPassword';
import ResetPassword from './Components/Auth/ResetPassword';
import AuthCallback from './Components/Auth/AuthCallback';
import Dashboard from './Components/Pages/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import PublicRoute from './Components/PublicRoute';

// Import all the pages you created
import TermsOfService from './Components/Pages/TermsOfService';
import PrivacyPolicy from './Components/Pages/PrivacyPolicy';
import CookiePolicy from './Components/Pages/CookiePolicy';
import Documentation from './Components/Pages/Documentation';
import ApiReference from './Components/Pages/ApiReference';
import Tutorials from './Components/Pages/Tutorials';

// This is the auth layout wrapper (for Login, Signup, etc.)
const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <Outlet />
  </div>
);

// This is the layout for the new policy/resource pages
const PageLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Outlet />
  </div>
);

// Define the application routes
const router = createBrowserRouter([
  {
    // --- PUBLIC AUTH ROUTES ---
    // (Login, Signup, Forgot Password, etc.)
    path: '/',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      // The default route "/" will redirect to "/login"
      { path: '/', element: <Navigate to="/login" replace /> },
    ],
  },
  {
    // --- PUBLIC POLICY & RESOURCE PAGES ---
    path: '/',
    element: <PageLayout />,
    children: [
      { path: 'terms-of-service', element: <TermsOfService /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'cookie-policy', element: <CookiePolicy /> },
      { path: 'documentation', element: <Documentation /> },
      { path: 'api-reference', element: <ApiReference /> },
      { path: 'tutorials', element: <Tutorials /> },
    ],
  },
  {
    // --- PROTECTED DASHBOARD ROUTE ---
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    // --- AUTH CALLBACK (NO LAYOUT) ---
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    // --- FALLBACK REDIRECT ---
    // Any other path redirects to login
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

function App() {
  // The RouterProvider handles everything
  return <RouterProvider router={router} />;
}

export default App;
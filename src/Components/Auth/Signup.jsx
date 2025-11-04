import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate
import { FaUser, FaLock, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import AuthFormInput from './AuthFormInput';

const Signup = () => { // 2. REMOVE onNavigate prop
  const navigate = useNavigate(); // 3. INITIALIZE navigate
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      // First check if response is OK
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Server error: ${response.status}`);
        }
        throw new Error(errorData.error || 'Signup failed');
      }

      // Process successful response
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // 4. ADD this to log user in
      navigate('/dashboard'); // 5. UPDATE navigation on success
      
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-24 mx-auto max-w-7xl">
      <div className="mx-auto w-full max-w-md transition-all duration-300">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>

          <div className="px-6 py-6 sm:px-8 sm:py-6">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create your account</h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Start your journey with Scrpcy</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthFormInput
                id="name"
                label="Full Name"
                type="text"
                icon={<FaUser className="text-gray-400" />}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <AuthFormInput
                id="email"
                label="Email"
                type="email"
                icon={<FaEnvelope className="text-gray-400" />}
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <AuthFormInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                icon={<FaLock className="text-gray-400" />}
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <AuthFormInput
                id="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                icon={<FaLock className="text-gray-400" />}
                showToggle
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <div className="flex items-start text-sm sm:text-base">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <label htmlFor="terms" className="ml-3 block text-gray-600">
                  I agree to the{' '}
                  <button type="button" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base ${(!acceptedTerms || isLoading) ? 'opacity-80' : ''
                  }`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Create Account <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl sm:px-8">
            <p className="text-center text-gray-600 text-sm sm:text-base">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')} // 6. UPDATE "Sign in" link
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
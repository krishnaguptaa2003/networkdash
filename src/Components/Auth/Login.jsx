import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaGithub, FaGoogle, FaTwitter } from 'react-icons/fa';
import AuthFormInput from './AuthFormInput';
import Cookies from 'js-cookie';

// --- HELPER FUNCTIONS FOR TWITTER (PKCE) ---
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const sha256 = async (buffer) => {
  return await crypto.subtle.digest('SHA-256', buffer);
};

const base64urlencode = (buffer) => {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
// --- END OF HELPER FUNCTIONS ---

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Enhanced Social Login Handler
  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    setError('');

    try {
      let authUrl;

      if (provider === 'twitter') {
        // Twitter PKCE Flow
        const code_verifier = generateRandomString(128);
        const state = generateRandomString(128);

        // Store the verifier and state in cookies
        Cookies.set('twitter_code_verifier', code_verifier, { 
          expires: 5 / (24 * 60),
          secure: true,
          sameSite: 'lax'
        });
        Cookies.set('twitter_state', state, { 
          expires: 5 / (24 * 60),
          secure: true,
          sameSite: 'lax'
        });

        // Create the 'code_challenge'
        const encoder = new TextEncoder();
        const data = encoder.encode(code_verifier);
        const hashed = await sha256(data);
        const code_challenge = base64urlencode(hashed);

        const params = new URLSearchParams({
          provider,
          state,
          code_challenge,
          code_challenge_method: 'S256',
        });
        authUrl = `/.netlify/functions/oauth-login?${params.toString()}`;

      } else {
        // Google and GitHub
        authUrl = `/.netlify/functions/oauth-login?provider=${provider}`;
      }

      // Redirect the user
      window.location.href = authUrl;

    } catch (error) {
      console.error(`${provider} login error:`, error);
      setError(`Failed to initiate ${provider} login. Please try again.`);
      setSocialLoading(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check for verification
      if (data.user && !data.user.is_verified) {
        navigate('/verify-email', { state: { email: data.user.email, fromLogin: true } });
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-20 xl:px-24 mx-auto max-w-7xl">
      <div className="mx-auto w-full max-w-md transition-all duration-300">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="px-6 py-8 sm:px-8 sm:py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome to Scrpcy</h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthFormInput
                id="login-email"
                label="Email Address"
                type="email"
                icon={<FaUser className="text-gray-400" />}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <AuthFormInput
                id="login-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                icon={<FaLock className="text-gray-400" />}
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaGoogle className="text-red-500 text-lg" />
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={socialLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'github' ? (
                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaGithub className="text-gray-800 text-lg" />
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('twitter')}
                  disabled={socialLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'twitter' ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaTwitter className="text-blue-400 text-lg" />
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our Terms and Privacy Policy
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl sm:px-8">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
/* eslint-disable no-undef */
const { getClient } = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helper to parse cookies from the request
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
};

// --- Google Helpers ---
async function getGoogleToken(code, redirectUri) {
  console.log('Getting Google token...');
  const url = 'https://oauth2.googleapis.com/token';
  const body = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Token Error:", errorText);
    throw new Error('Failed to fetch Google token');
  }
  return response.json();
}

async function getGoogleProfile(accessToken) {
  console.log('Getting Google profile...');
  const url = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Profile Error:", errorText);
    throw new Error('Failed to fetch Google profile');
  }
  return response.json();
}

// --- GitHub Helpers ---
async function getGitHubToken(code, redirectUri) {
  console.log('Getting GitHub token...');
  const url = 'https://github.com/login/oauth/access_token';
  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("GitHub Token Error:", errorText);
    throw new Error('Failed to fetch GitHub token');
  }
  return response.json();
}

async function getGitHubProfile(accessToken) {
  console.log('Getting GitHub profile...');
  const url = 'https://api.github.com/user';
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'NetworkDashApp',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("GitHub Profile Error:", errorText);
    throw new Error('Failed to fetch GitHub profile');
  }
  return response.json();
}

async function getGitHubEmails(accessToken) {
  console.log('Getting GitHub emails...');
  const url = 'https://api.github.com/user/emails';
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'NetworkDashApp',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("GitHub Emails Error:", errorText);
    throw new Error('Failed to fetch GitHub emails');
  }
  return response.json();
}

// --- TWITTER HELPERS ---
async function getTwitterToken(code, redirectUri, codeVerifier) {
  console.log('Getting Twitter token...');
  const url = 'https://api.twitter.com/2/oauth2/token';
  
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  // Twitter uses Basic Auth for the token exchange
  const basicAuth = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twitter Token Error:', errorText);
    throw new Error('Failed to fetch Twitter token');
  }
  return response.json();
}

async function getTwitterProfile(accessToken) {
  console.log('Getting Twitter profile...');
  // Use only valid user fields for Twitter API v2
  const userFields = ['id', 'name', 'username', 'profile_image_url'].join(',');
  const url = `https://api.twitter.com/2/users/me?user.fields=${userFields}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twitter Profile Error:', errorText);
    throw new Error('Failed to fetch Twitter profile');
  }
  
  const profileData = await response.json();
  console.log('Twitter profile data:', profileData);
  return profileData;
}

// --- END OF TWITTER HELPERS ---

// This function finds an existing user or creates a new one
async function findOrCreateUser(client, email, name, isVerified = false, provider = 'oauth') {
  console.log(`Finding or creating user: ${email}, ${name}, verified: ${isVerified}`);
  
  let user;
  const { rows: existingUser } = await client.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.length > 0) {
    user = existingUser[0];
    console.log('Found existing user:', user.id);
  } else {
    // Create a dummy password for social-only signups
    const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const { rows: newUser } = await client.query(
      `INSERT INTO users (name, email, password_hash, is_verified) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, dummyHash, isVerified]
    );
    user = newUser[0];
    console.log('Created new user:', user.id);
  }
  return user;
}

// Enhanced frontend URL detection
const getFrontendUrl = (event, rootUrl) => {
  console.log('Detecting frontend URL...');
  console.log('Root URL:', rootUrl);
  console.log('FRONTEND_URL env:', process.env.FRONTEND_URL);
  
  // Priority 1: Use FRONTEND_URL environment variable
  if (process.env.FRONTEND_URL) {
    console.log('Using FRONTEND_URL from env:', process.env.FRONTEND_URL);
    return process.env.FRONTEND_URL;
  }
  
  // Priority 2: Detect from request origin (for local development)
  const requestOrigin = event.headers.origin || event.headers.referer;
  console.log('Request origin:', requestOrigin);
  
  if (requestOrigin) {
    try {
      const url = new URL(requestOrigin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        const frontendUrl = `${url.protocol}//${url.host}`;
        console.log('Using localhost frontend URL:', frontendUrl);
        return frontendUrl;
      }
    } catch (e) {
      console.log('Could not parse origin:', requestOrigin);
    }
  }
  
  // Priority 3: Fallback to Netlify URL or localhost
  if (rootUrl.includes('localhost') || rootUrl.includes('127.0.0.1')) {
    console.log('Using default localhost frontend URL');
    return 'http://localhost:5173';
  }
  
  // Priority 4: Use Netlify URL without functions path
  const netlifyUrl = rootUrl.replace(/\.netlify\.app.*$/, '.netlify.app');
  console.log('Using Netlify frontend URL:', netlifyUrl);
  return netlifyUrl;
};

exports.handler = async (event) => {
  console.log('=== OAUTH HANDLER STARTED ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Query Parameters:', event.queryStringParameters);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  
  const { provider, code, state } = event.queryStringParameters;
  const cookies = parseCookies(event.headers.cookie);
  const rootUrl = process.env.URL || 'http://localhost:8888';
  
  // Enhanced URL detection
  const frontendUrl = getFrontendUrl(event, rootUrl);
  const redirectUri = `${rootUrl}/.netlify/functions/oauth-handler?provider=${provider}`;
  
  console.log('OAuth Handler Configuration:', {
    provider,
    frontendUrl,
    rootUrl,
    redirectUri,
    hasCode: !!code,
    hasState: !!state,
    hasTwitterVerifier: !!cookies.twitter_code_verifier,
    hasTwitterState: !!cookies.twitter_state
  });

  // Validate required parameters
  if (!provider) {
    console.error('Missing provider parameter');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing provider parameter' })
    };
  }

  if (!code) {
    console.error('Missing authorization code');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing authorization code' })
    };
  }

  let client;
  let user;

  try {
    client = await getClient();
    console.log('Database connected successfully');

    if (provider === 'google') {
      console.log('Processing Google OAuth...');
      const tokenData = await getGoogleToken(code, redirectUri);
      console.log('Google token received');
      
      const profile = await getGoogleProfile(tokenData.access_token);
      console.log('Google profile received:', { email: profile.email, name: profile.name });
      
      user = await findOrCreateUser(
        client, 
        profile.email, 
        profile.name, 
        profile.verified_email,
        'google'
      );
      
    } else if (provider === 'github') {
      console.log('Processing GitHub OAuth...');
      const tokenData = await getGitHubToken(code, redirectUri);
      console.log('GitHub token received');
      
      const [profile, emails] = await Promise.all([
        getGitHubProfile(tokenData.access_token),
        getGitHubEmails(tokenData.access_token)
      ]);
      
      console.log('GitHub profile received:', { login: profile.login, name: profile.name });
      console.log('GitHub emails received:', emails);
      
      const primaryEmail = emails.find(e => e.primary && e.verified);
      if (!primaryEmail) {
        console.error('No verified primary email found on GitHub');
        throw new Error('No verified primary email found on GitHub. Please ensure your GitHub account has a verified primary email address.');
      }

      user = await findOrCreateUser(
        client,
        primaryEmail.email,
        profile.name || profile.login,
        true,
        'github'
      );
      
    } else if (provider === 'twitter') {
      console.log('Processing Twitter OAuth...');
      
      // 1. Check state for security
      const savedState = cookies.twitter_state;
      if (!state || !savedState || state !== savedState) {
        console.error('State validation failed:', { state, savedState });
        throw new Error('Invalid state. CSRF attack detected.');
      }

      // 2. Get the verifier from the cookie
      const codeVerifier = cookies.twitter_code_verifier;
      if (!codeVerifier) {
        console.error('Missing code verifier');
        throw new Error('Missing code verifier. Session timed out.');
      }

      // 3. Get token
      const tokenData = await getTwitterToken(code, redirectUri, codeVerifier);
      console.log('Twitter token received');
      
      // 4. Get profile (without email field)
      const profileData = await getTwitterProfile(tokenData.access_token);
      const profile = profileData.data;
      
      if (!profile) {
        throw new Error('No profile data received from Twitter');
      }

      console.log('Twitter profile received:', { 
        id: profile.id, 
        username: profile.username, 
        name: profile.name 
      });

      // 5. Create email from username (Twitter often doesn't provide email)
      const userEmail = `${profile.username}@twitter.scrpcy.app`;
      const name = profile.name || profile.username;

      user = await findOrCreateUser(
        client,
        userEmail,
        name,
        false, // Twitter emails are not verified by default
        'twitter'
      );
      
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // --- COMMON SUCCESS ---
    console.log('OAuth successful, creating JWT token for user:', user.id);
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { password_hash, ...userWithoutPassword } = user;
    const userJson = JSON.stringify(userWithoutPassword);
    
    const callbackUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userJson)}`;
    
    console.log('Redirecting to callback URL:', callbackUrl);

    return {
      statusCode: 302,
      headers: {
        Location: callbackUrl,
        // Clear Twitter cookies
        'Set-Cookie': [
          'twitter_code_verifier=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax',
          'twitter_state=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax'
        ],
      },
    };

  } catch (error) {
    console.error('OAuth Error Details:', {
      message: error.message,
      stack: error.stack,
      provider: provider
    });
    
    const errorMessage = encodeURIComponent(error.message);
    const errorUrl = `${frontendUrl}/login?error=oauth_failed&message=${errorMessage}&provider=${provider}`;
    
    console.log('Redirecting to error URL:', errorUrl);
    
    return {
      statusCode: 302,
      headers: {
        Location: errorUrl,
      },
    };
  } finally {
    if (client) {
      await client.end();
      console.log('Database connection closed');
    }
    console.log('=== OAUTH HANDLER COMPLETED ===');
  }
};
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
    console.error("Google Token Error:", await response.json());
    throw new Error('Failed to fetch Google token');
  }
  return response.json();
}
async function getGoogleProfile(accessToken) {
  const url = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Google profile');
  return response.json();
}

// --- GitHub Helpers ---
async function getGitHubToken(code) {
  const url = 'https://github.com/login/oauth/access_token';
  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json' // Request JSON response
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Failed to fetch GitHub token');
  return response.json();
}
async function getGitHubProfile(accessToken) {
  const url = 'https://api.github.com/user';
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'NetworkDashApp'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch GitHub profile');
  return response.json();
}
async function getGitHubEmails(accessToken) {
  const url = 'https://api.github.com/user/emails';
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'NetworkDashApp'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch GitHub emails');
  return response.json();
}

// --- TWITTER HELPERS ---
async function getTwitterToken(code, redirectUri, codeVerifier) {
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
    console.error('Twitter Token Error:', await response.text());
    throw new Error('Failed to fetch Twitter token');
  }
  return response.json();
}

async function getTwitterProfile(accessToken) {
  // --- FIX #2: Correct user.fields according to Twitter API v2 ---
  const userFields = ['id', 'name', 'username', 'profile_image_url'].join(',');
  const url = `https://api.twitter.com/2/users/me?user.fields=${userFields}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('Twitter Profile Error:', await response.text());
    throw new Error('Failed to fetch Twitter profile');
  }
  
  const profileData = await response.json();
  return profileData;
}

// --- END OF TWITTER HELPERS ---

// This function finds an existing user or creates a new one
async function findOrCreateUser(client, email, name, isVerified = false) {
  let user;
  const { rows: existingUser } = await client.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.length > 0) {
    user = existingUser[0];
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
  }
  return user;
}


exports.handler = async (event) => {
  const { provider, code, state } = event.queryStringParameters;
  const cookies = parseCookies(event.headers.cookie);
  const rootUrl = process.env.URL || 'http://localhost:8888';
  
  // FIX: Use the request origin for local development
  const requestOrigin = event.headers.origin || 'http://localhost:5173';
  const isLocalDev = rootUrl.includes('localhost') || rootUrl.includes('127.0.0.1');
  const frontendUrl = isLocalDev ? requestOrigin : (process.env.FRONTEND_URL || 'http://localhost:5173');
  
  const redirectUri = `${rootUrl}/.netlify/functions/oauth-handler?provider=${provider}`;
  
  let client;
  let user;

  try {
    client = await getClient();

    if (provider === 'google') {
      const tokenData = await getGoogleToken(code, redirectUri);
      const profile = await getGoogleProfile(tokenData.access_token);
      
      user = await findOrCreateUser(
        client, 
        profile.email, 
        profile.name, 
        profile.verified_email
      );
    } 
    
    else if (provider === 'github') {
      const tokenData = await getGitHubToken(code);
      const [profile, emails] = await Promise.all([
        getGitHubProfile(tokenData.access_token),
        getGitHubEmails(tokenData.access_token)
      ]);
      
      const primaryEmail = emails.find(e => e.primary && e.verified);
      if (!primaryEmail) {
        throw new Error('No verified primary email found on GitHub');
      }

      user = await findOrCreateUser(
        client,
        primaryEmail.email,
        profile.name || profile.login,
        true
      );
    } 
    
    else if (provider === 'twitter') {
      // 1. Check state for security
      const savedState = cookies.twitter_state;
      if (!state || !savedState || state !== savedState) {
        throw new Error('Invalid state. CSRF attack detected.');
      }

      // 2. Get the verifier from the cookie
      const codeVerifier = cookies.twitter_code_verifier;
      if (!codeVerifier) {
        throw new Error('Missing code verifier. Session timed out.');
      }

      // 3. Get token
      const tokenData = await getTwitterToken(code, redirectUri, codeVerifier);
      
      // 4. Get profile (without email field)
      const profileData = await getTwitterProfile(tokenData.access_token);
      const profile = profileData.data;

      // 5. Create email from username (Twitter often doesn't provide email)
      const userEmail = `${profile.username}@twitter.placeholder`;
      const name = profile.name || profile.username;

      user = await findOrCreateUser(
        client,
        userEmail,
        name,
        false // Twitter emails are not verified by default
      );
    } 
    
    else {
      throw new Error('Invalid provider');
    }

    // --- COMMON SUCCESS ---
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { password_hash, ...userWithoutPassword } = user;
    const userJson = JSON.stringify(userWithoutPassword);
    
    // FIX: Use the correct frontend URL for callback
    const callbackUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userJson)}`;

    return {
      statusCode: 302,
      headers: {
        Location: callbackUrl,
        // Clear cookies
        'Set-Cookie': [
          'twitter_code_verifier=; Max-Age=0; Path=/; HttpOnly',
          'twitter_state=; Max-Age=0; Path=/; HttpOnly'
        ],
      },
    };

  } catch (error) {
    console.error('OAuth Error:', error.message);
    return {
      statusCode: 302,
      headers: {
        Location: `${frontendUrl}/login?error=oauth_failed`,
      },
    };
  } finally {
    if (client) await client.end();
  }
};
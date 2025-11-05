/* eslint-disable no-undef */
// This function handles the callback from the social provider
// after the user has authorized the app.

const { getClient } = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// --- HELPER FUNCTIONS ---

// 1. Google
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
  if (!response.ok) throw new Error('Failed to fetch Google token');
  return response.json();
}

async function getGoogleProfile(accessToken) {
  const url = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Google profile');
  const profile = await response.json();
  return {
    email: profile.email,
    name: profile.name,
    verified: profile.verified_email,
  };
}

// 2. GitHub
async function getGitHubToken(code, redirectUri) {
  const url = 'https://github.com/login/oauth/access_token';
  const body = {
    code,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    redirect_uri: redirectUri,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json' // Important for GitHub
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
      Authorization: `token ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch GitHub profile');
  const profile = await response.json();
  
  // GitHub doesn't always provide a public email
  let email = profile.email;
  if (!email) {
    // If primary email is private, fetch all emails
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${accessToken}` },
    });
    const emails = await emailResponse.json();
    const primaryEmail = emails.find(e => e.primary && e.verified);
    if (!primaryEmail) throw new Error('No verified primary email found on GitHub');
    email = primaryEmail.email;
  }
  
  return {
    email: email,
    name: profile.name || profile.login, // Use name, fallback to login
    verified: true, // We check for a verified email
  };
}

// 3. Twitter (Placeholder - requires complex PKCE flow)
async function getTwitterProfile(code) {
  console.warn('Twitter login is not yet implemented');
  throw new Error('Twitter login is not supported');
  // This would involve exchanging the code for a token, then fetching profile
}

// --- MAIN HANDLER ---

exports.handler = async (event) => {
  const { code, provider } = event.queryStringParameters;
  const redirectUri = `${process.env.URL}/.netlify/functions/oauth-handler?provider=${provider}`;
  
  let client;
  let profile;
  
  try {
    // --- Step 1: Get Profile from Social Provider ---
    switch (provider) {
      case 'google': {
        const tokenData = await getGoogleToken(code, redirectUri);
        profile = await getGoogleProfile(tokenData.access_token);
        break;
      }
      case 'github': {
        const tokenData = await getGitHubToken(code, redirectUri);
        profile = await getGitHubProfile(tokenData.access_token);
        break;
      }
      case 'twitter': {
        profile = await getTwitterProfile(code);
        break;
      }
      default:
        throw new Error('Invalid provider');
    }

    if (!profile || !profile.verified) {
      throw new Error('Email not verified by social provider');
    }

    // --- Step 2: Find or Create User in *Our* Database ---
    client = await getClient();
    let user;
    const { rows: existingUser } = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [profile.email]
    );

    if (existingUser.length > 0) {
      // User exists! Just fetch them.
      user = existingUser[0];
    } else {
      // User doesn't exist. Create a new account.
      // We create a "dummy" password hash because our table requires one.
      const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      
      const { rows: newUser } = await client.query(
        `INSERT INTO users (name, email, password_hash, is_verified) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, is_verified`,
        [profile.name, profile.email, dummyHash, true] // Mark as verified
      );
      user = newUser[0];
    }
    
    // --- Step 3: Create *Our* JWT Token ---
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // --- Step 4: Redirect User to Frontend Callback Page ---
    const frontendUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;

    return {
      statusCode: 302, // This is a redirect
      headers: { Location: frontendUrl },
    };

  } catch (error) {
    console.error('OAuth Error:', error.message);
    return {
      statusCode: 302,
      headers: { Location: `${process.env.FRONTEND_URL}/login?error=oauth_failed` },
    };
  } finally {
    if (client) await client.end();
  }
};

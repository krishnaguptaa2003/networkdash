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

// --- Google Helpers --- (No changes)
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

// --- GitHub Helpers --- (No changes)
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
  // This function is correct, no changes
  console.log('Getting Twitter token...');
  const url = 'https://api.twitter.com/2/oauth2/token';
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
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
  // --- THIS IS THE FIX ---
  // We remove 'email' from the fields we request
  const userFields = 'id,name,username,profile_image_url';
  const url = `https://api.twitter.com/2/users/me?user.fields=${userFields}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twitter Profile Error:', errorText);
    throw new Error('Failed to fetch Twitter profile');
  }
  const profileData = await response.json();
  console.log('Twitter profile data (no email):', profileData);
  return profileData;
}
// --- END OF TWITTER HELPERS ---

async function findOrCreateUser(client, email, name, isVerified = false, provider = 'oauth') {
  // This function is correct, no changes
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

const getFrontendUrl = (event, rootUrl) => {
  // This function is correct, no changes
  console.log('Detecting frontend URL...');
  if (process.env.FRONTEND_URL) {
    console.log('Using FRONTEND_URL from env:', process.env.FRONTEND_URL);
    return process.env.FRONTEND_URL;
  }
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
  if (rootUrl.includes('localhost') || rootUrl.includes('127.0.0.1')) {
    console.log('Using default localhost frontend URL');
    return 'http://localhost:5173';
  }
  const netlifyUrl = rootUrl.replace(/\.netlify\.app.*$/, '.netlify.app');
  console.log('Using Netlify frontend URL:', netlifyUrl);
  return netlifyUrl;
};

// --- Main Handler ---
exports.handler = async (event) => {
  console.log('=== OAUTH HANDLER STARTED ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Query Parameters:', event.queryStringParameters);

  let provider = event.queryStringParameters.provider;
  if (provider && provider.includes('?')) {
    provider = provider.split('?')[0];
  }

  const { code, state } = event.queryStringParameters;
  const cookies = parseCookies(event.headers.cookie);
  const rootUrl = process.env.URL || 'http://localhost:8888';
  const frontendUrl = getFrontendUrl(event, rootUrl);
  const redirectUri = `${rootUrl}/.netlify/functions/oauth-handler?provider=${provider}`;

  console.log('OAuth Handler Configuration:', {
    provider,
    frontendUrl,
    rootUrl,
    redirectUri,
    hasCode: !!code,
    hasState: !!state,
  });

  if (!provider) {
    console.error('Missing provider parameter');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing provider parameter' })
    };
  }

  if (!code) {
    console.error('Missing authorization code. Likely scope error or user cancellation.');
    const errorUrl = `${frontendUrl}/login?error=oauth_failed&message=Authorization%20code%20missing.`;
    return {
      statusCode: 302,
      headers: { Location: errorUrl },
    };
  }

  let client;
  let user;
  let token;
  let responseHeaders = {};
  let responseMultiValueHeaders = {}; 

  try {
    client = await getClient();
    console.log('Database connected successfully');

    if (provider === 'google') {
      // Working, no changes
      console.log('Processing Google OAuth...');
      const tokenData = await getGoogleToken(code, redirectUri);
      const profile = await getGoogleProfile(tokenData.access_token);
      user = await findOrCreateUser(
        client,
        profile.email,
        profile.name,
        profile.verified_email,
        'google'
      );
    } else if (provider === 'github') {
      // Working, no changes
      console.log('Processing GitHub OAuth...');
      const tokenData = await getGitHubToken(code, redirectUri);
      const [profile, emails] = await Promise.all([
        getGitHubProfile(tokenData.access_token),
        getGitHubEmails(tokenData.access_token)
      ]);
      const primaryEmail = emails.find(e => e.primary && e.verified);
      if (!primaryEmail) {
        throw new Error('No verified primary email found on GitHub.');
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
      const savedState = cookies.twitter_state;
      if (!state || !savedState || state !== savedState) {
        throw new Error('Invalid state. CSRF attack detected.');
      }
      const codeVerifier = cookies.twitter_code_verifier;
      if (!codeVerifier) {
        throw new Error('Missing code verifier. Session timed out.');
      }
      const tokenData = await getTwitterToken(code, redirectUri, codeVerifier);
      const profileData = await getTwitterProfile(tokenData.access_token);
      const profile = profileData.data; 
      if (!profile) {
        throw new Error('No profile data received from Twitter');
      }
      
      // --- THIS IS THE FIX ---
      // We can't get email, so we create a placeholder email
      const userEmail = `${profile.username}@twitter.user`; 
      const name = profile.name || profile.username;

      console.log('Twitter profile received (no email):', { ...profile });
      user = await findOrCreateUser(
        client,
        userEmail, // Use the placeholder
        name,
        false, // Mark as not verified
        'twitter'
      );

      responseMultiValueHeaders['Set-Cookie'] = [
        'twitter_code_verifier=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax',
        'twitter_state=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax'
      ];

    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // --- COMMON SUCCESS ---
    console.log('OAuth successful, creating JWT token for user:', user.id);
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    const { password_hash, ...userWithoutPassword } = user;
    const userJson = JSON.stringify(userWithoutPassword);
    const callbackUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(userJson)}`;
    
    console.log('Redirecting to callback URL:', callbackUrl);
    responseHeaders['Location'] = callbackUrl;

    return {
      statusCode: 302,
      headers: responseHeaders,
      multiValueHeaders: responseMultiValueHeaders,
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
      headers: { 'Location': errorUrl },
    };
  } finally {
    if (client) {
      await client.end();
      console.log('Database connection closed');
    }
    console.log('=== OAUTH HANDLER COMPLETED ===');
  }
};
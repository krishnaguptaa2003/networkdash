/* eslint-disable no-undef */
const crypto = require('crypto');

// This function just builds the correct URL and redirects the user
exports.handler = async (event) => {
  const provider = event.queryStringParameters.provider;
  let authUrl;

  // Use the live URL or localhost
  const rootUrl = process.env.URL || 'http://localhost:8888';
  
  // This is the URL our backend handler will live at
  const redirectUri = `${rootUrl}/.netlify/functions/oauth-handler?provider=${provider}`;

  if (provider === 'google') {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`;
  
  } else if (provider === 'github') {
    
    // --- THIS IS THE FIX ---
    // It's a space ' ' not a comma ','
    const scope = 'read:user user:email';
    // --- END OF FIX ---

    authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  } else if (provider === 'twitter') {
    // Twitter is much more complex (PKCE flow)
    // We will build this in the next step.
    return {
      statusCode: 302,
      headers: { Location: `${process.env.FRONTEND_URL}/login?error=twitter_not_implemented` },
    };
  } else {
    return {
      statusCode: 400,
      body: 'Invalid provider',
    };
  }

  // Redirect the user to the social login page
  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
    },
  };
};


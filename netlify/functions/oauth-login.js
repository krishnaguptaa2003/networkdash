/* eslint-disable no-undef */

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
    // This is the fixed version with a space, not a comma
    const scope = 'read:user user:email'; 
    authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  } else if (provider === 'twitter') {
    // We get these from the frontend query string
    const { state, code_challenge, code_challenge_method } =
      event.queryStringParameters;

    // --- FIX #1: Added 'email.read' scope for Twitter ---
    const scope = 'users.read tweet.read offline.access email.read'; 

    const params = new URLSearchParams({
      client_id: process.env.TWITTER_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: 'code',
      state: state,
      code_challenge: code_challenge,
      code_challenge_method: code_challenge_method,
    });
    authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  
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
/* eslint-disable no-undef */
// This function builds the correct URL and redirects the user
// to the social provider's login page.

exports.handler = async (event) => {
  const { provider } = event.queryStringParameters;
  const redirectUri = `${process.env.URL}/.netlify/functions/oauth-handler`;

  let authUrl = '';

  switch (provider) {
    case 'google': {
      const scope = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' ');
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}?provider=google&response_type=code&scope=${scope}&prompt=select_account`;
      break;
    }
    case 'github': {
      const scope = 'read:user,user:email';
      authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}?provider=github&scope=${scope}`;
      break;
    }
    case 'twitter': {
      // Twitter OAuth 2.0 uses a different flow (PKCE) which is more complex
      // For now, let's log a placeholder
      console.warn('Twitter login is not yet implemented');
      // We'll just redirect back to login for now
      authUrl = `${process.env.FRONTEND_URL}/login?error=twitter_not_implemented`;
      break;
    }
    default:
      return {
        statusCode: 400,
        body: 'Invalid provider',
      };
  }

  // Redirect the user
  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
    },
  };
};

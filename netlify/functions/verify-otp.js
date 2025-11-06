/* eslint-disable no-undef */
const { getClient } = require('./db');
const jwt = require('jsonwebtoken');

// Helper function for consistent JSON responses
const jsonResponse = (status, body) => ({
  statusCode: status,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let client;
  try {
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return jsonResponse(400, { error: 'Email and OTP are required' });
    }

    client = await getClient();
    
    // Find the user by email
    const { rows } = await client.query(
      `SELECT * FROM users 
       WHERE email = $1`,
      [email]
    );

    if (rows.length === 0) {
      return jsonResponse(404, { error: 'User not found' });
    }

    const user = rows[0];

    // Check if already verified
    if (user.is_verified) {
      return jsonResponse(400, { error: 'Email is already verified' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return jsonResponse(400, { error: 'Invalid OTP' });
    }

    // Check if OTP is expired (10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (user.otp_created_at < tenMinutesAgo) {
      return jsonResponse(400, { error: 'OTP has expired. Please request a new one.' });
    }

    // --- Success! ---
    // Mark user as verified and clear the OTP
    await client.query(
      'UPDATE users SET is_verified = TRUE, otp = NULL, otp_created_at = NULL WHERE email = $1',
      [email]
    );

    // Generate a JWT token to log them in
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { password_hash, ...userWithoutPassword } = user;
    // Set is_verified to true for the returned user object
    userWithoutPassword.is_verified = true; 

    return jsonResponse(200, { 
      message: 'Email verified successfully',
      token: token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error:', error);
    return jsonResponse(500, { error: 'Internal server error' });
  } finally {
    if (client) {
      await client.end();
    }
  }
};

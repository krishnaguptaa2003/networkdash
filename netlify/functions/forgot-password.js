// D:\Github\networkdash\netlify\functions\forgot-password.js
// **** THIS IS THE UPDATED FILE ****

const { getClient } = require('./db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Helper function for consistent JSON responses
const jsonResponse = (status, body) => ({
  statusCode: status,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
});

// Create Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.handler = async (event) => {
  let client;
  try {
    client = await getClient();
    const body = JSON.parse(event.body);

    // --- 1. HANDLE 'POST' (User requested a reset link) ---
    if (event.httpMethod === 'POST') {
      const { email } = body;
      if (!email) {
        return jsonResponse(400, { error: 'Email is required' });
      }

      const { rows: users } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (users.length === 0) {
        return jsonResponse(200, { message: 'Reset email sent (if user exists)' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // --- 1. THIS IS THE FIRST CHANGE ---
      // Set expiry for 30 minutes from now
      const resetTokenExpiry = new Date(Date.now() + 1800000); // 30 minutes (was 3600000)

      await client.query(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
        [resetToken, resetTokenExpiry, email]
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Send the email
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Reset Instructions',
        html: `
          <p>You requested a password reset for your NetworkDash account.</p>
          
          <p>Click this link to reset your password (it expires in 30 minutes):</p>
          
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>If you did not request this, please ignore this email.</p>
        `
      });

      return jsonResponse(200, { message: 'Reset email sent' });
    }

    // --- 2. HANDLE 'PUT' (User is submitting a new password) ---
    else if (event.httpMethod === 'PUT') {
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return jsonResponse(400, { error: 'Token and new password are required' });
      }

      const { rows: users } = await client.query(
        'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );

      if (users.length === 0) {
        return jsonResponse(400, { error: 'Invalid or expired token' });
      }

      const user = users[0];
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // --- THIS CODE MAKES IT ONE-TIME-USE ---
      // By setting reset_token = NULL, the token is instantly invalidated.
      await client.query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
        [hashedPassword, user.id]
      );

      return jsonResponse(200, { message: 'Password updated successfully' });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });

  } catch (error) {
    console.error('Error:', error);
    return jsonResponse(500, { error: 'Internal server error' });
  } finally {
    if (client) {
      await client.end();
    }
  }
};
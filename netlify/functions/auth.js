/* eslint-disable no-undef */
const { getClient } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// --- NEW: Send Verification OTP Email ---
const sendVerificationEmail = (email, name, otp) => {
  transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your NetworkDash Account',
    html: `
      <h3>Hi ${name},</h3>
      <p>Thanks for signing up! Please use the following 6-digit code to verify your email address:</p>
      <h2 style="font-size: 24px; letter-spacing: 2px; text-align: center;">${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
      <br/>
      <p>The NetworkDash Team</p>
    `
  }).catch(err => {
    console.error('Failed to send OTP email:', err);
  });
};

// --- Send Welcome Email (for OAuth) ---
const sendWelcomeEmail = (email, name) => {
  transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to NetworkDash!',
    html: `
      <h3>Hi ${name},</h3>
      <p>Welcome to NetworkDash! We're excited to have you on board.</p>
      <p>You can now log in to your account using this email as your username:</p>
      <p><strong>Username: ${email}</strong></p>
      <br/>
      <p>Thanks,</p>
      <p>The NetworkDash Team</p>
    `
  }).catch(err => {
    console.error('Failed to send welcome email:', err);
  });
};


exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  if (!body.action) {
    return jsonResponse(400, { error: 'Invalid action' });
  }
  
  let client;
  try {
    client = await getClient();

    // --- SIGNUP ACTION (UPDATED) ---
    if (body.action === 'signup') {
      const { name, email, password, confirmPassword } = body;

      if (!name || !email || !password) {
        return jsonResponse(400, { error: 'All fields are required' });
      }
      if (password !== confirmPassword) {
        return jsonResponse(400, { error: 'Passwords do not match' });
      }
      const { rows: existingUser } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (existingUser.length > 0) {
        return jsonResponse(409, { error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpCreatedAt = new Date();

      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, otp, otp_created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email`,
        [name, email, hashedPassword, otp, otpCreatedAt]
      );
      
      const user = rows[0];

      sendVerificationEmail(user.email, user.name, otp);

      // --- THIS IS THE FIX ---
      // We no longer send a token. We just send a success message
      // and the email address.
      return jsonResponse(201, { 
        message: 'Signup successful. Please verify your email.',
        email: user.email 
      });
    }

    // --- LOGIN ACTION (UPDATED) ---
    if (body.action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return jsonResponse(400, { error: 'Email and password are required' });
      }

      const { rows } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (rows.length === 0) {
        return jsonResponse(401, { error: 'Invalid email or password' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return jsonResponse(401, { error: 'Invalid email or password' });
      }

      // --- VERIFICATION CHECK ---
      if (!user.is_verified) {
        return jsonResponse(403, { 
          error: 'Email not verified. Please check your inbox for your 6-digit code.',
          email: user.email // Send email so frontend can redirect
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      const { password_hash, ...userWithoutPassword } = user;
      return jsonResponse(200, { user: userWithoutPassword, token });
    }

    return jsonResponse(400, { error: 'Invalid action' });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    return jsonResponse(500, { error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.end();
    }
  }
};


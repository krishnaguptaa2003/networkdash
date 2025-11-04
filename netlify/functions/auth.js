// D:\Github\networkdash\netlify\functions\auth.js
// **** THIS IS THE UPDATED FILE ****

const { getClient } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // <--- 1. IMPORT nodemailer

// Helper function for consistent JSON responses
const jsonResponse = (status, body) => ({
  statusCode: status,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
});

// --- 2. CREATE EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // Use 'true' for 465, 'false' for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// --- 3. CREATE A "sendEmail" function ---
// We make this separate so we don't wait for the email to send
// before confirming the signup to the user.
const sendWelcomeEmail = (email, name) => {
  transporter.sendMail({
    from: process.env.SMTP_FROM, // This will look like "Scrpcy <your-email@gmail.com>"
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
    // Log the error if email fails, but don't crash the signup
    console.error('Failed to send welcome email:', err);
  });
};


exports.handler = async (event) => {
  // ... (existing code: httpMethod check, body parsing, etc) ...
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

    // --- SIGNUP ACTION ---
    if (body.action === 'signup') {
      const { name, email, password, confirmPassword } = body;

      // ... (existing validation checks) ...
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

      // Insert new user
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, email, is_verified`,
        [name, email, hashedPassword]
      );
      
      const user = rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // --- 4. SEND THE WELCOME EMAIL ---
      // We do this *after* everything else is successful.
      // We don't use 'await' so the user gets a fast response.
      sendWelcomeEmail(user.email, user.name);

      return jsonResponse(201, { user, token }); // 201 Created
    }

    // --- LOGIN ACTION ---
    if (body.action === 'login') {
      // ... (existing login logic - no changes needed here) ...
      const { email, password } = body;

      if (!email || !password) {
        return jsonResponse(400, { error: 'Email and password are required' });
      }

      const { rows } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (rows.length === 0) {
        return jsonResponse(404, { error: 'Invalid email or password' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return jsonResponse(401, { error: 'Invalid email or password' });
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
// D:\Github\networkdash\netlify\functions\init-db.js
// **** THIS IS THE CORRECTED FILE ****

const { getClient } = require('./db');

exports.handler = async () => {
  const client = await getClient();
  try {
    // Create users table with all required columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        otp VARCHAR(10),
        otp_created_at TIMESTAMP,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create devices table (converted from your MySQL version)
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plant VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        ip_address VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: 'Tables created or already exist' })
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await client.end();
  }
};
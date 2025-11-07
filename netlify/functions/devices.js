/* eslint-disable no-undef */
const { getClient } = require('./db'); // Uses the same 'pg' client as your other functions
const jwt = require('jsonwebtoken');

// Helper function for consistent JSON responses
const jsonResponse = (status, body) => ({
  statusCode: status,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
});

exports.handler = async (event) => {
  const token = event.headers.authorization?.split(' ')[1];
  if (!token) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  let client;
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    console.error('Invalid token:', error);
    return jsonResponse(401, { error: 'Invalid token' });
  }

  try {
    client = await getClient();

    if (event.httpMethod === 'GET') {
      const { rows: devices } = await client.query(
        'SELECT * FROM devices WHERE user_id = $1',
        [userId]
      );
      return jsonResponse(200, devices);
    } 
    else if (event.httpMethod === 'POST') {
      const { plant, department, ip_address } = JSON.parse(event.body);
      const { rows } = await client.query(
        'INSERT INTO devices (plant, department, ip_address, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [plant, department, ip_address, userId]
      );
      return jsonResponse(201, { id: rows[0].id });
    } 
    else if (event.httpMethod === 'PUT') {
      const { id, plant, department, ip_address } = JSON.parse(event.body);
      await client.query(
        'UPDATE devices SET plant = $1, department = $2, ip_address = $3 WHERE id = $4 AND user_id = $5',
        [plant, department, ip_address, id, userId]
      );
      return jsonResponse(200, { message: 'Device updated' });
    } 
    else if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      await client.query(
        'DELETE FROM devices WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return jsonResponse(200, { message: 'Device deleted' });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });

  } catch (error) {
    console.error('Device function error:', error);
    return jsonResponse(500, { error: 'Internal server error' });
  } finally {
    if (client) {
      await client.end();
    }
  }
};
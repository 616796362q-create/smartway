const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in the environment variables.');
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Keep connections alive across warm serverless invocations
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    })
  : null;

module.exports = {
  query: (text, params) => {
    if (!pool) {
      return Promise.reject(new Error('DATABASE_URL is not configured on the server.'));
    }
    return pool.query(text, params);
  },
  pool,
};

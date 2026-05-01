const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    console.log('Adding missing columns to machine_logs...');
    await pool.query(`
      ALTER TABLE machine_logs 
      ADD COLUMN IF NOT EXISTS start_time TIMESTAMP,
      ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
    `);
    console.log('SUCCESS: Missing columns added!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

fix();

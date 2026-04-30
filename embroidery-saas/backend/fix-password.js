const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    console.log('Resetting demo password...');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('demo123', salt);
    
    const res = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, 'demo@aa.com']);
    
    if (res.rowCount > 0) {
        console.log('Success: Password for demo@aa.com reset to demo123');
    } else {
        console.log('Error: User demo@aa.com not found.');
    }
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    await pool.end();
  }
}

fix();

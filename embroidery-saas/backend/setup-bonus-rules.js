const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    console.log('Setting up Bonus Rules table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bonus_rules (
          id SERIAL PRIMARY KEY,
          factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
          min_stitches INTEGER NOT NULL,
          bonus_amount DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(factory_id)
      );
    `);
    console.log('SUCCESS: Bonus Rules table created!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

setup();

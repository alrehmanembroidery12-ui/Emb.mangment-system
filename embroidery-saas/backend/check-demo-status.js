const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT f.id, f.name, f.is_readonly, u.email 
      FROM factories f 
      JOIN users u ON f.id = u.factory_id 
      WHERE u.email = 'demo@aa.com';
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();

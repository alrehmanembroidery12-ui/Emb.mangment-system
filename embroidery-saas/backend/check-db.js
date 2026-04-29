const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    console.log('Checking database...');
    
    // Check for factories
    const factoryRes = await pool.query('SELECT * FROM factories WHERE is_demo = TRUE');
    console.log('Demo Factories found:', factoryRes.rowCount);
    if (factoryRes.rowCount > 0) {
        console.log('Factory Name:', factoryRes.rows[0].name);
    }

    // Check for users
    const userRes = await pool.query("SELECT id, full_name, email FROM users WHERE email = 'demo@aa.com'");
    console.log('Demo User found:', userRes.rowCount);
    if (userRes.rowCount > 0) {
        console.log('User Details:', userRes.rows[0]);
    }

    // Check for other data (workers)
    const workerRes = await pool.query('SELECT count(*) FROM workers');
    console.log('Total Workers in DB:', workerRes.rows[0].count);

  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await pool.end();
  }
}

check();

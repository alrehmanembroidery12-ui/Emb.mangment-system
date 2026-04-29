const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query("SELECT id, full_name, email, factory_id FROM users WHERE email = 'demo@aa.com'");
    console.log('User:', res.rows[0]);
    
    if (res.rows[0].factory_id) {
        const facRes = await pool.query("SELECT * FROM factories WHERE id = $1", [res.rows[0].factory_id]);
        console.log('Linked Factory:', facRes.rows[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();

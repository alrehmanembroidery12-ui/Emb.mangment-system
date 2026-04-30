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
    const userRes = await pool.query("SELECT id, full_name, email, factory_id FROM users WHERE email = 'demo@aa.com'");
    console.log('Demo User found:', userRes.rowCount);
    if (userRes.rowCount > 0) {
        console.log('User Details:', userRes.rows[0]);
        const factoryId = userRes.rows[0].factory_id;
        
        // Test JOIN query
        try {
            const joinRes = await pool.query(`
                SELECT u.id, f.name as factory_name
                FROM users u 
                JOIN factories f ON u.factory_id = f.id 
                WHERE u.email = 'demo@aa.com'
            `);
            console.log('JOIN test successful. Factory:', joinRes.rows[0]?.factory_name);
        } catch (joinErr) {
            console.error('JOIN test FAILED:', joinErr.message);
        }
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

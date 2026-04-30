const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing UNIQUE constraint on orders...');
    await pool.query("INSERT INTO orders (factory_id, client_id, order_number, total_price) VALUES (3, null, 'TEST-DUP', 100)");
    console.log('First insert success');
    await pool.query("INSERT INTO orders (factory_id, client_id, order_number, total_price) VALUES (3, null, 'TEST-DUP', 100)");
    console.log('Second insert success (NO UNIQUE CONSTRAINT)');
  } catch (err) {
    console.log('ERROR:', err.message);
  } finally {
    // Cleanup
    await pool.query("DELETE FROM orders WHERE order_number = 'TEST-DUP'");
    await pool.end();
  }
}
test();

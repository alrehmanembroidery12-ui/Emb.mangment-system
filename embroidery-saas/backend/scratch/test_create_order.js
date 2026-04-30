const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing createOrder logic...');
    // Simulate what's in orderController.js
    const factory_id = 3;
    const client_id = 1; // Assuming client 1 exists
    const order_number = 'SCRATCH-101';
    const total_price = 1000;
    const advance_paid = 200;
    const production_cost = 500;
    const fabric_quantity = 10;
    const due_date = '2026-12-31';

    await pool.query('BEGIN');

    const orderResult = await pool.query(
      `INSERT INTO orders (factory_id, client_id, order_number, total_price, advance_paid, production_cost, fabric_quantity, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [factory_id, client_id, order_number, total_price, advance_paid, production_cost, fabric_quantity, due_date]
    );
    console.log('Order created');

    const order = orderResult.rows[0];

    await pool.query(
      `INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, debit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [factory_id, client_id, order.id, total_price, 'Debit', `Bill for Order #${order_number}`, total_price]
    );
    console.log('Debit transaction created');

    if (advance_paid > 0) {
      await pool.query(
        `INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, credit) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [factory_id, client_id, order.id, advance_paid, 'Credit', `Advance for Order #${order_number}`, advance_paid]
      );
      console.log('Credit transaction created');
    }

    await pool.query('COMMIT');
    console.log('SUCCESS: Order and transactions saved.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('FAILED:', err.message);
  } finally {
    // Cleanup
    await pool.query("DELETE FROM orders WHERE order_number = 'SCRATCH-101'");
    await pool.end();
  }
}
test();

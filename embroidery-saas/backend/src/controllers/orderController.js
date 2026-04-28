const db = require('../config/db');

// Get all orders with client names, shop name, phone and Profit calculation
exports.getOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, c.name as client_name, c.shop_name, c.phone,
       (o.total_price - o.production_cost) as net_profit 
       FROM orders o 
       LEFT JOIN clients c ON o.client_id = c.id 
       WHERE o.factory_id = $1 
       ORDER BY o.created_at DESC`,
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Create Order with Cost and Ledger Transaction
exports.createOrder = async (req, res) => {
  const { client_id, order_number, total_price, advance_paid, production_cost, fabric_quantity, due_date } = req.body;
  try {
    await db.query('BEGIN');

    // 1. Create the order
    const orderResult = await db.query(
      `INSERT INTO orders (factory_id, client_id, order_number, total_price, advance_paid, production_cost, fabric_quantity, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.factory_id, client_id, order_number, total_price, advance_paid, production_cost, fabric_quantity, due_date]
    );

    const order = orderResult.rows[0];

    // 2. Add Bill to Client Ledger (Credit)
    await db.query(
      `INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.factory_id, client_id, order.id, total_price, 'Credit', `Bill for Order #${order_number}`]
    );

    // 3. Add Advance Payment to Client Ledger (Debit) if any
    if (advance_paid && parseFloat(advance_paid) > 0) {
      await db.query(
        `INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.factory_id, client_id, order.id, advance_paid, 'Debit', `Advance for Order #${order_number}`]
      );
    }

    await db.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Overdue Orders (Deadline Tracking)
exports.getOverdueOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, c.name as client_name 
       FROM orders o 
       JOIN clients c ON o.client_id = c.id 
       WHERE o.factory_id = $1 AND o.due_date < CURRENT_DATE AND o.status != 'Delivered' AND o.status != 'Completed'`,
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 AND factory_id = $3 RETURNING *',
      [status, id, req.user.factory_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

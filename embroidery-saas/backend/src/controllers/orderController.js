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
  
  // Debug log to see what's coming from frontend
  console.log('Creating Order Request:', {
    factory_id: req.user.factory_id,
    client_id,
    order_number,
    total_price
  });

  try {
    await db.query('BEGIN');

    // Data Sanitization: Ensure empty strings are handled as NULL or 0
    const sanitized_client_id = client_id && client_id !== '' ? parseInt(client_id) : null;
    const sanitized_total_price = parseFloat(total_price) || 0;
    const sanitized_advance_paid = parseFloat(advance_paid) || 0;
    const sanitized_production_cost = parseFloat(production_cost) || 0;
    const sanitized_fabric_quantity = parseFloat(fabric_quantity) || 0;
    const sanitized_due_date = due_date && due_date !== '' ? due_date : null;

    // 1. Create the order
    const orderResult = await db.query(
      `INSERT INTO orders (factory_id, client_id, order_number, total_price, advance_paid, production_cost, fabric_quantity, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.factory_id, sanitized_client_id, order_number, sanitized_total_price, sanitized_advance_paid, sanitized_production_cost, sanitized_fabric_quantity, sanitized_due_date]
    );

    const order = orderResult.rows[0];

    // 2. Add Bill to Client Ledger (Debit - Client owes money) if client exists
    if (sanitized_client_id) {
      await db.query(
        `INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, debit, credit) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
        [req.user.factory_id, sanitized_client_id, order.id, sanitized_total_price, 'Debit', `Bill for Order #${order_number}`, sanitized_total_price]
      );

      // 3. Add Advance Payment to Client Ledger (Credit - Client paid us) if any
      if (sanitized_advance_paid > 0) {
        await db.query(
          `INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, credit, debit) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
          [req.user.factory_id, sanitized_client_id, order.id, sanitized_advance_paid, 'Credit', `Advance for Order #${order_number}`, sanitized_advance_paid]
        );
      }
    }

    await db.query('COMMIT');
    console.log('Order created successfully:', order.id);
    res.status(201).json(order);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('ORDER CREATION ERROR:', err.message);
    res.status(500).json({ 
      message: 'Server Error: Order save nahi ho saka', 
      error: err.message,
      details: err.detail // Useful for constraint errors
    });
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

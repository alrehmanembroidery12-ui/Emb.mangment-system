const db = require('../config/db');

// Get all clients with their balance
exports.getClients = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        c.*, 
        COALESCE(SUM(CASE WHEN t.transaction_type = 'Debit' THEN t.amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN t.transaction_type = 'Credit' THEN t.amount ELSE 0 END), 0) as balance
      FROM clients c
      LEFT JOIN client_transactions t ON c.id = t.client_id
      WHERE c.factory_id = $1
      GROUP BY c.id
      ORDER BY c.name ASC`,
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add new client
exports.addClient = async (req, res) => {
  const { name, shop_name, email, phone, address } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO clients (factory_id, name, shop_name, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.factory_id, name, shop_name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

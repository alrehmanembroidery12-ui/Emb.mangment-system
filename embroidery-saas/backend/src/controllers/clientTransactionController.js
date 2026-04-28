const db = require('../config/db');

// Add a client transaction (Payment/Debit)
exports.addClientTransaction = async (req, res) => {
  const { client_id, amount, transaction_type, description, transaction_date } = req.body;
  try {
    const date = transaction_date || new Date();
    const result = await db.query(
      `INSERT INTO client_transactions (factory_id, client_id, amount, transaction_type, description, transaction_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.factory_id, client_id, amount, transaction_type, description, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get client transaction history
exports.getClientTransactions = async (req, res) => {
  const { client_id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM client_transactions 
       WHERE factory_id = $1 AND client_id = $2 
       ORDER BY transaction_date DESC`,
      [req.user.factory_id, client_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

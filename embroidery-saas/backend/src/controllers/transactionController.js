const db = require('../config/db');

// Add a transaction (Salary, Advance, Bonus, etc.)
exports.addTransaction = async (req, res) => {
  const { worker_id, amount, transaction_type, description, transaction_date } = req.body;
  try {
    const date = transaction_date || new Date();
    const credit = transaction_type === 'Credit' ? amount : 0;
    const debit = transaction_type === 'Debit' ? amount : 0;

    const result = await db.query(
      `INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, transaction_date, credit, debit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.factory_id, worker_id, amount, transaction_type, description, date, credit, debit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get transaction history for a specific worker with month/year filtering
exports.getWorkerTransactions = async (req, res) => {
  const { worker_id } = req.params;
  const { month, year } = req.query;
  
  try {
    let query = 'SELECT * FROM worker_transactions WHERE worker_id = $1 AND factory_id = $2';
    const params = [worker_id, req.user.factory_id];
    
    if (month && year) {
      query += ' AND EXTRACT(MONTH FROM transaction_date) = $3 AND EXTRACT(YEAR FROM transaction_date) = $4';
      params.push(month, year);
    }
    
    query += ' ORDER BY transaction_date DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Worker Summary (Total Earnings, Total Paid, Net Balance)
exports.getWorkerSummary = async (req, res) => {
  const { worker_id } = req.params;
  try {
    const result = await db.query(
      `SELECT 
        SUM(CASE WHEN transaction_type = 'Credit' THEN amount ELSE 0 END) as total_earnings,
        SUM(CASE WHEN transaction_type = 'Debit' THEN amount ELSE 0 END) as total_paid
       FROM worker_transactions 
       WHERE worker_id = $1 AND factory_id = $2`,
      [worker_id, req.user.factory_id]
    );
    
    const summary = result.rows[0];
    const net_balance = (summary.total_earnings || 0) - (summary.total_paid || 0);
    
    res.json({
      total_earnings: summary.total_earnings || 0,
      total_paid: summary.total_paid || 0,
      net_balance: net_balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

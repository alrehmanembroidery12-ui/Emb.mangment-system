const db = require('../config/db');

exports.getClientReport = async (req, res) => {
  const { client_id, start_date, end_date } = req.query;
  const { factory_id } = req.user;

  try {
    const result = await db.query(
      `SELECT * FROM client_transactions 
       WHERE client_id = $1 AND factory_id = $2 
       AND transaction_date BETWEEN $3 AND $4 
       ORDER BY transaction_date ASC`,
      [client_id, factory_id, start_date, end_date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getFactoryReport = async (req, res) => {
  const { start_date, end_date } = req.query;
  const { factory_id } = req.user;

  try {
    // 1. Fetch Income (Client Payments)
    const incomeResult = await db.query(
      `SELECT * FROM client_transactions 
       WHERE factory_id = $1 AND transaction_type = 'Credit' 
       AND transaction_date BETWEEN $2 AND $3 
       ORDER BY transaction_date ASC`,
      [factory_id, start_date, end_date]
    );

    // 2. Fetch Expenses (Worker Transactions - Advances/Salary)
    const expenseResult = await db.query(
      `SELECT * FROM worker_transactions 
       WHERE factory_id = $1 
       AND transaction_date BETWEEN $2 AND $3 
       ORDER BY transaction_date ASC`,
      [factory_id, start_date, end_date]
    );

    res.json({
      income: incomeResult.rows,
      expense: expenseResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

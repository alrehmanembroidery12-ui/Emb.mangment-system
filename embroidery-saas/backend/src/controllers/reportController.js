const db = require('../config/db');

exports.getClientReport = async (req, res) => {
  const { client_id, start_date, end_date } = req.query;
  const { factory_id } = req.user;

  try {
    const result = await db.query(
      `SELECT *, 
       CASE WHEN transaction_type = 'Debit' THEN COALESCE(NULLIF(debit, 0), amount) ELSE 0 END as final_debit,
       CASE WHEN transaction_type = 'Credit' THEN COALESCE(NULLIF(credit, 0), amount) ELSE 0 END as final_credit
       FROM client_transactions 
       WHERE client_id = $1 AND factory_id = $2 
       AND transaction_date::date BETWEEN $3::date AND $4::date 
       ORDER BY transaction_date ASC`,
      [client_id, factory_id, start_date, end_date]
    );
    // Map to keep frontend compatible
    const mappedRows = result.rows.map(r => ({
      ...r,
      debit: r.final_debit,
      credit: r.final_credit
    }));
    res.json(mappedRows);
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
      `SELECT *, COALESCE(NULLIF(credit, 0), amount) as final_amount FROM client_transactions 
       WHERE factory_id = $1 AND transaction_type = 'Credit' 
       AND transaction_date::date BETWEEN $2::date AND $3::date 
       ORDER BY transaction_date ASC`,
      [factory_id, start_date, end_date]
    );

    // 2. Fetch Expenses (Worker Transactions - Advances/Salary)
    const expenseResult = await db.query(
      `SELECT *, COALESCE(NULLIF(amount, 0), debit) as final_amount FROM worker_transactions 
       WHERE factory_id = $1 
       AND transaction_date::date BETWEEN $2::date AND $3::date 
       ORDER BY transaction_date ASC`,
      [factory_id, start_date, end_date]
    );

    res.json({
      income: incomeResult.rows.map(r => ({ ...r, credit: r.final_amount })),
      expense: expenseResult.rows.map(r => ({ ...r, amount: r.final_amount }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

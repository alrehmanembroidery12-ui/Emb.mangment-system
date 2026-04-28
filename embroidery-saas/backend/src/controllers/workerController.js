const db = require('../config/db');

// Get all workers for the factory with balance calculations
exports.getWorkers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        w.*, 
        COALESCE(SUM(CASE WHEN t.transaction_type = 'Credit' THEN t.amount ELSE 0 END), 0) as total_bonus,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'Debit' THEN t.amount ELSE 0 END), 0) as total_advance,
        (w.base_salary + COALESCE(SUM(CASE WHEN t.transaction_type = 'Credit' THEN t.amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN t.transaction_type = 'Debit' THEN t.amount ELSE 0 END), 0)) as balance
      FROM workers w
      LEFT JOIN worker_transactions t ON w.id = t.worker_id
      WHERE w.factory_id = $1
      GROUP BY w.id
      ORDER BY w.created_at DESC`,
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add new worker
exports.addWorker = async (req, res) => {
  const { name, phone, salary_type, base_salary, bonus, advance } = req.body;
  try {
    // Start transaction
    await db.query('BEGIN');

    const result = await db.query(
      'INSERT INTO workers (factory_id, name, phone, salary_type, base_salary) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.factory_id, name, phone, salary_type, base_salary]
    );

    const worker = result.rows[0];

    // Add initial bonus if provided
    if (bonus && parseFloat(bonus) > 0) {
      await db.query(
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.factory_id, worker.id, bonus, 'Credit', 'Initial Bonus']
      );
    }

    // Add initial advance if provided
    if (advance && parseFloat(advance) > 0) {
      await db.query(
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.factory_id, worker.id, advance, 'Debit', 'Initial Advance']
      );
    }

    await db.query('COMMIT');
    res.status(201).json(worker);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update worker
exports.updateWorker = async (req, res) => {
  const { id } = req.params;
  const { name, phone, salary_type, base_salary, is_active, bonus, advance } = req.body;
  try {
    await db.query('BEGIN');

    const result = await db.query(
      'UPDATE workers SET name = $1, phone = $2, salary_type = $3, base_salary = $4, is_active = $5 WHERE id = $6 AND factory_id = $7 RETURNING *',
      [name, phone, salary_type, base_salary, is_active, id, req.user.factory_id]
    );

    if (result.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Add additional bonus if provided
    if (bonus && parseFloat(bonus) > 0) {
      await db.query(
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.factory_id, id, bonus, 'Credit', 'Additional Bonus']
      );
    }

    // Add additional advance if provided
    if (advance && parseFloat(advance) > 0) {
      await db.query(
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.factory_id, id, advance, 'Debit', 'Additional Advance']
      );
    }

    await db.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server Error');
  }
};

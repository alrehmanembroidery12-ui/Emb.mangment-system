const db = require('../config/db');

// Get all workers for the factory with balance calculations
exports.getWorkers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        w.*, 
        COALESCE(SUM(t.credit), 0) as total_bonus,
        COALESCE(SUM(t.debit), 0) as total_advance,
        (w.base_salary + COALESCE(SUM(t.credit), 0) - COALESCE(SUM(t.debit), 0)) as balance
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
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, credit) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.factory_id, worker.id, bonus, 'Credit', 'Initial Bonus', bonus]
      );
    }

    // Add initial advance if provided
    if (advance && parseFloat(advance) > 0) {
      await db.query(
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, debit) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.factory_id, worker.id, advance, 'Debit', 'Initial Advance', advance]
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
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, credit) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.factory_id, id, bonus, 'Credit', 'Additional Bonus', bonus]
      );
    }

    // Add additional advance if provided
    if (advance && parseFloat(advance) > 0) {
      await db.query(
        'INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, debit) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.factory_id, id, advance, 'Debit', 'Additional Advance', advance]
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
// Generate monthly salary for all active workers
exports.generateMonthlySalary = async (req, res) => {
  const { month, year } = req.body;
  const factory_id = req.user.factory_id;

  try {
    // 1. Check if salaries already generated for this month
    const checkRes = await db.query(
      `SELECT count(*) FROM worker_transactions 
       WHERE factory_id = $1 
       AND description LIKE 'Monthly Salary %' 
       AND EXTRACT(MONTH FROM transaction_date) = $2 
       AND EXTRACT(YEAR FROM transaction_date) = $3`,
      [factory_id, month, year]
    );

    if (parseInt(checkRes.rows[0].count) > 0) {
      return res.status(400).json({ message: 'Salaries already generated for this month' });
    }

    // 2. Get all active workers
    const workersRes = await db.query(
      'SELECT id, name, base_salary FROM workers WHERE factory_id = $1 AND is_active = TRUE',
      [factory_id]
    );

    const workers = workersRes.rows;
    if (workers.length === 0) {
      return res.status(404).json({ message: 'No active workers found' });
    }

    // 3. Start Transaction
    await db.query('BEGIN');

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const description = `Monthly Salary - ${monthName} ${year}`;
    const transaction_date = new Date(year, month - 1, 1); // Set to 1st of the month

    for (const worker of workers) {
      if (parseFloat(worker.base_salary) > 0) {
        await db.query(
          `INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, transaction_date, credit, debit) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [factory_id, worker.id, worker.base_salary, 'Credit', description, transaction_date, worker.base_salary, 0]
        );
      }
    }

    await db.query('COMMIT');
    res.json({ message: `Successfully generated salaries for ${workers.length} workers for ${monthName} ${year}` });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server Error');
  }
};

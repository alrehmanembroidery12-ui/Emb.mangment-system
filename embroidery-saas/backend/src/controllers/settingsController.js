const db = require('../config/db');
const bcrypt = require('bcryptjs');

// --- Bonus Rules ---
exports.getBonusRules = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bonus_rules WHERE factory_id = $1',
      [req.user.factory_id]
    );
    res.json(result.rows[0] || { min_stitches: 0, bonus_amount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateBonusRules = async (req, res) => {
  const { min_stitches, bonus_amount } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO bonus_rules (factory_id, min_stitches, bonus_amount) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (factory_id) 
       DO UPDATE SET min_stitches = EXCLUDED.min_stitches, bonus_amount = EXCLUDED.bonus_amount 
       RETURNING *`,
      [req.user.factory_id, min_stitches, bonus_amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// --- Factory Profile ---
exports.getFactoryProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT name, address, phone, subscription_status, subscription_plan, trial_ends_at FROM factories WHERE id = $1',
      [req.user.factory_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateFactoryProfile = async (req, res) => {
  const { name, address, phone } = req.body;
  const factory_id = req.user.factory_id;

  console.log('UPDATING PROFILE:', { name, address, phone, factory_id });

  try {
    if (!factory_id) {
      return res.status(400).json({ message: 'Factory ID is missing from token' });
    }

    const result = await db.query(
      'UPDATE factories SET name = $1, address = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, address, phone, factory_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Factory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Profile Error Details:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// --- Team Management ---
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE factory_id = $1 ORDER BY created_at DESC',
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.addUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (factory_id, full_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role',
      [req.user.factory_id, full_name, email, hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Don't allow deleting yourself
    if (id == req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    await db.query('DELETE FROM users WHERE id = $1 AND factory_id = $2', [id, req.user.factory_id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// --- Data Export ---
exports.exportAllData = async (req, res) => {
  try {
    const factory_id = req.user.factory_id;
    const data = {};

    // Parallel fetch for speed
    const [workers, machines, orders, clients, inventory, logs, transactions] = await Promise.all([
      db.query('SELECT * FROM workers WHERE factory_id = $1', [factory_id]),
      db.query('SELECT * FROM machines WHERE factory_id = $1', [factory_id]),
      db.query('SELECT * FROM orders WHERE factory_id = $1', [factory_id]),
      db.query('SELECT * FROM clients WHERE factory_id = $1', [factory_id]),
      db.query('SELECT * FROM inventory WHERE factory_id = $1', [factory_id]),
      db.query('SELECT * FROM machine_logs WHERE factory_id = $1', [factory_id]),
      db.query('SELECT * FROM worker_transactions WHERE factory_id = $1', [factory_id])
    ]);

    data.workers = workers.rows;
    data.machines = machines.rows;
    data.orders = orders.rows;
    data.clients = clients.rows;
    data.inventory = inventory.rows;
    data.machine_logs = logs.rows;
    data.worker_transactions = transactions.rows;
    data.export_date = new Date().toISOString();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

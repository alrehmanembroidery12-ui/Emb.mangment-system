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

exports.importData = async (req, res) => {
  const factory_id = req.user.factory_id;
  const data = req.body;

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ message: 'Invalid backup data' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Clear existing data for this factory (in reverse order of dependencies)
    await client.query('DELETE FROM machine_logs WHERE factory_id = $1', [factory_id]);
    await client.query('DELETE FROM worker_transactions WHERE factory_id = $1', [factory_id]);
    await client.query('DELETE FROM orders WHERE factory_id = $1', [factory_id]);
    await client.query('DELETE FROM inventory WHERE factory_id = $1', [factory_id]);
    await client.query('DELETE FROM machines WHERE factory_id = $1', [factory_id]);
    await client.query('DELETE FROM workers WHERE factory_id = $1', [factory_id]);
    await client.query('DELETE FROM clients WHERE factory_id = $1', [factory_id]);

    // 2. Insert new data (in order of dependencies)
    
    // Clients
    if (data.clients) {
      for (const c of data.clients) {
        await client.query(
          'INSERT INTO clients (id, factory_id, name, shop_name, phone, address, balance) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [c.id, factory_id, c.name, c.shop_name, c.phone, c.address, c.balance]
        );
      }
    }

    // Workers
    if (data.workers) {
      for (const w of data.workers) {
        await client.query(
          'INSERT INTO workers (id, factory_id, name, phone, salary_type, base_salary, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [w.id, factory_id, w.name, w.phone, w.salary_type, w.base_salary, w.is_active]
        );
      }
    }

    // Machines
    if (data.machines) {
      for (const m of data.machines) {
        await client.query(
          'INSERT INTO machines (id, factory_id, name, model_number, total_heads, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [m.id, factory_id, m.name, m.model_number, m.total_heads, m.status]
        );
      }
    }

    // Inventory
    if (data.inventory) {
      for (const i of data.inventory) {
        await client.query(
          'INSERT INTO inventory (id, factory_id, item_name, item_code, category, quantity, unit, min_stock_level, unit_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [i.id, factory_id, i.item_name, i.item_code, i.category, i.quantity, i.unit, i.min_stock_level, i.unit_price]
        );
      }
    }

    // Orders
    if (data.orders) {
      for (const o of data.orders) {
        await client.query(
          'INSERT INTO orders (id, factory_id, client_id, order_number, status, total_price, advance_paid, production_cost, fabric_quantity, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [o.id, factory_id, o.client_id, o.order_number, o.status, o.total_price, o.advance_paid, o.production_cost, o.fabric_quantity, o.due_date]
        );
      }
    }

    // Machine Logs
    if (data.machine_logs) {
      for (const l of data.machine_logs) {
        await client.query(
          'INSERT INTO machine_logs (id, factory_id, machine_id, worker_id, stitches_count, shift, downtime_minutes, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [l.id, factory_id, l.machine_id, l.worker_id, l.stitches_count, l.shift, l.downtime_minutes, l.start_time, l.end_time]
        );
      }
    }

    // Worker Transactions
    if (data.worker_transactions) {
      for (const t of data.worker_transactions) {
        await client.query(
          'INSERT INTO worker_transactions (id, factory_id, worker_id, amount, transaction_type, description, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [t.id, factory_id, t.worker_id, t.amount, t.transaction_type, t.description, t.transaction_date]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Data imported successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import Error:', err);
    res.status(500).json({ message: 'Error importing data', error: err.message });
  } finally {
    client.release();
  }
};

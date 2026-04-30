const db = require('../config/db');

// Get all inventory items with their latest stock
exports.getInventory = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM inventory WHERE factory_id = $1 ORDER BY category ASC, item_code ASC, item_name ASC',
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add new item to inventory (Thread, Bobbin, Spare Parts, etc.)
exports.addItem = async (req, res) => {
  const { item_name, item_code, category, quantity, unit, min_stock_level, unit_price } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO inventory (factory_id, item_name, item_code, category, quantity, unit, min_stock_level, unit_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.factory_id, item_name, item_code, category, quantity || 0, unit, min_stock_level || 0, unit_price || 0]
    );
    
    // Initial stock transaction
    if (quantity > 0) {
      await db.query(
        'INSERT INTO inventory_transactions (factory_id, item_id, quantity, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.factory_id, result.rows[0].id, quantity, 'In', 'Initial Stock']
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update stock quantity via In/Out Transaction
exports.logTransaction = async (req, res) => {
  const { item_id, quantity, transaction_type, description, transaction_date, bill_amount } = req.body;
  try {
    await db.query('BEGIN');
    
    const date = transaction_date || new Date();
    const amount = bill_amount || 0;
    
    // 1. Log the transaction
    await db.query(
      'INSERT INTO inventory_transactions (factory_id, item_id, quantity, transaction_type, description, transaction_date, bill_amount) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [req.user.factory_id, item_id, quantity, transaction_type, description, date, amount]
    );

    // 2. Update the main inventory quantity
    const updateQuery = transaction_type === 'In' 
      ? 'UPDATE inventory SET quantity = quantity + $1 WHERE id = $2'
      : 'UPDATE inventory SET quantity = quantity - $1 WHERE id = $2';
    
    await db.query(updateQuery, [quantity, item_id]);

    await db.query('COMMIT');
    res.status(200).json({ message: 'Transaction logged successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get transaction history for an item
exports.getItemHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM inventory_transactions WHERE item_id = $1 ORDER BY transaction_date DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update item details (metadata)
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { item_name, item_code, category, unit, min_stock_level, unit_price } = req.body;
  try {
    const result = await db.query(
      `UPDATE inventory 
       SET item_name = $1, item_code = $2, category = $3, unit = $4, min_stock_level = $5, unit_price = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 AND factory_id = $8 RETURNING *`,
      [item_name, item_code, category, unit, min_stock_level, unit_price || 0, id, req.user.factory_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

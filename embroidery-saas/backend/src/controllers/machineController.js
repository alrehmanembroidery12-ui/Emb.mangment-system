const db = require('../config/db');

// Add new machine
exports.addMachine = async (req, res) => {
  const { name, model_number, total_heads } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO machines (factory_id, name, model_number, total_heads) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.factory_id, name, model_number, total_heads]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Log Production (Stitch Count, Shift, Operator)
exports.logProduction = async (req, res) => {
  const { machine_id, worker_id, stitches_count, shift, downtime_minutes, start_time, end_time } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO machine_logs (factory_id, machine_id, worker_id, stitches_count, shift, downtime_minutes, start_time, end_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.factory_id, machine_id, worker_id, stitches_count, shift, downtime_minutes, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get all machines
exports.getMachines = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM machines WHERE factory_id = $1 ORDER BY created_at DESC',
      [req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update machine
exports.updateMachine = async (req, res) => {
  const { id } = req.params;
  const { name, model_number, total_heads, status } = req.body;
  try {
    const result = await db.query(
      'UPDATE machines SET name = $1, model_number = $2, total_heads = $3, status = $4 WHERE id = $5 AND factory_id = $6 RETURNING *',
      [name, model_number, total_heads, status, id, req.user.factory_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Machine not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete machine
exports.deleteMachine = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM machines WHERE id = $1 AND factory_id = $2', [id, req.user.factory_id]);
    res.json({ message: 'Machine deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Machine Efficiency Stats
exports.getMachineStats = async (req, res) => {
  const { machine_id } = req.params;
  const { start_date, end_date } = req.query;
  try {
    let query = `
      SELECT 
        shift,
        SUM(stitches_count) as total_stitches,
        SUM(downtime_minutes) as total_downtime,
        AVG(stitches_count) as avg_stitches
      FROM machine_logs 
      WHERE machine_id = $1 AND factory_id = $2
    `;
    const params = [machine_id, req.user.factory_id];

    if (start_date && end_date) {
      query += ` AND created_at BETWEEN $3 AND $4`;
      params.push(start_date, end_date);
    }

    query += ` GROUP BY shift`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

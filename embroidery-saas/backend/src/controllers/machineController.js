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

// Get Machine Efficiency Stats
exports.getMachineStats = async (req, res) => {
  const { machine_id } = req.params;
  try {
    const result = await db.query(
      `SELECT 
        shift,
        SUM(stitches_count) as total_stitches,
        SUM(downtime_minutes) as total_downtime,
        AVG(stitches_count) as avg_stitches
       FROM machine_logs 
       WHERE machine_id = $1 AND factory_id = $2
       GROUP BY shift`,
      [machine_id, req.user.factory_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

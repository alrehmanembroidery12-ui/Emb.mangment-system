const db = require('../config/db');

exports.getClientReport = async (req, res) => {
  try {
    const { factory_id } = req.user;
    // Basic placeholder logic
    const result = await db.query('SELECT * FROM clients WHERE factory_id = $1', [factory_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getFactoryReport = async (req, res) => {
  try {
    const { factory_id } = req.user;
    // Basic placeholder logic
    const result = await db.query('SELECT * FROM factories WHERE id = $1', [factory_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

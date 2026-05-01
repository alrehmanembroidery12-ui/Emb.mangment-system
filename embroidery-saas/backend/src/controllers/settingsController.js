const db = require('../config/db');

// Get Bonus Rules
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

// Update Bonus Rules
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

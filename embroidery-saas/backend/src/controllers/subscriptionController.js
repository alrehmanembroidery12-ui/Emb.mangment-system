const db = require('../config/db');

// Upgrade to Monthly Plan
exports.upgradeToMonthly = async (req, res) => {
  try {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const result = await db.query(
      `UPDATE factories 
       SET subscription_plan = 'Monthly', 
           subscription_status = 'Active', 
           subscription_ends_at = $1 
       WHERE id = $2 RETURNING *`,
      [nextMonth, req.user.factory_id]
    );

    res.json({ message: 'Upgraded to Monthly Plan successfully', factory: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Subscription Info
exports.getSubscriptionInfo = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT subscription_plan, subscription_status, trial_ends_at, subscription_ends_at FROM factories WHERE id = $1',
      [req.user.factory_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

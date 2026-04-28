const db = require('../config/db');

const checkSubscription = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT subscription_status, trial_ends_at, subscription_ends_at, subscription_plan FROM factories WHERE id = $1',
      [req.user.factory_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Factory not found' });

    const factory = result.rows[0];
    const now = new Date();

    // Check Trial Expiry
    if (factory.subscription_plan === 'Trial' && new Date(factory.trial_ends_at) < now) {
      await db.query('UPDATE factories SET subscription_status = $1 WHERE id = $2', ['Expired', req.user.factory_id]);
      return res.status(402).json({ 
        message: 'Your free trial has expired. Please upgrade to a monthly plan to continue.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Check Monthly Subscription Expiry
    if (factory.subscription_plan === 'Monthly' && factory.subscription_ends_at && new Date(factory.subscription_ends_at) < now) {
      await db.query('UPDATE factories SET subscription_status = $1 WHERE id = $2', ['Expired', req.user.factory_id]);
      return res.status(402).json({ 
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    if (factory.subscription_status === 'Expired') {
      return res.status(402).json({ message: 'Account expired. Please contact billing.' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports = checkSubscription;

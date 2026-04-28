const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const factory_id = req.user.factory_id;

    // 1. Workers Summary
    const workersResult = await db.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active FROM workers WHERE factory_id = $1',
      [factory_id]
    );

    // 2. Orders Status Summary
    const ordersResult = await db.query(
      'SELECT status, COUNT(*) as count FROM orders WHERE factory_id = $1 GROUP BY status',
      [factory_id]
    );

    // 3. Profit Summary
    const profitResult = await db.query(
      'SELECT SUM(total_price) as revenue, SUM(production_cost) as cost FROM orders WHERE factory_id = $1 AND status != $2',
      [factory_id, 'Cancelled']
    );

    // 4. Machine Efficiency (Average stitches per log entry as a simple metric)
    const machineResult = await db.query(
      'SELECT AVG(stitches_count) as avg_efficiency FROM machine_logs WHERE factory_id = $1',
      [factory_id]
    );

    // 5. Monthly Revenue (for Chart)
    const chartResult = await db.query(
      `SELECT TO_CHAR(created_at, 'Mon') as month, SUM(total_price) as amount 
       FROM orders 
       WHERE factory_id = $1 AND created_at > CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) ASC`,
      [factory_id]
    );

    // 6. Financial Summary (Receivables/Payables)
    const receivableResult = await db.query(
      'SELECT SUM(credit - debit) as total FROM client_transactions WHERE factory_id = $1',
      [factory_id]
    );

    const payableResult = await db.query(
      'SELECT SUM(credit - debit) as total FROM worker_transactions WHERE factory_id = $1',
      [factory_id]
    );

    res.json({
      workers: workersResult.rows[0],
      orders: ordersResult.rows,
      profit: {
        revenue: profitResult.rows[0].revenue || 0,
        cost: profitResult.rows[0].cost || 0,
        net_profit: (profitResult.rows[0].revenue || 0) - (profitResult.rows[0].cost || 0)
      },
      efficiency: machineResult.rows[0].avg_efficiency || 0,
      chartData: chartResult.rows,
      finances: {
        receivable: receivableResult.rows[0].total || 0,
        payable: payableResult.rows[0].total || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

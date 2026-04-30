const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function sync() {
  try {
    console.log('Syncing worker_transactions credit/debit columns...');
    const res = await pool.query(`
      UPDATE worker_transactions 
      SET 
        credit = CASE WHEN transaction_type = 'Credit' THEN amount ELSE 0 END, 
        debit = CASE WHEN transaction_type = 'Debit' THEN amount ELSE 0 END 
      WHERE (credit = 0 AND debit = 0) OR (credit IS NULL AND debit IS NULL)
    `);
    console.log('Success: Updated ' + res.rowCount + ' rows.');
  } catch (err) {
    console.error('Sync failed:', err.message);
  } finally {
    await pool.end();
  }
}

sync();

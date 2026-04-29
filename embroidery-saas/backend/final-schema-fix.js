const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    console.log('Applying Final Schema Fixes...');
    
    await pool.query(`
      -- 1. Add Subscription columns to factories
      ALTER TABLE factories 
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'Active',
      ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'Trial',
      ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
      ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;

      -- 2. Add credit/debit/order_id columns to client_transactions if missing
      ALTER TABLE client_transactions 
      ADD COLUMN IF NOT EXISTS credit DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS debit DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL;

      -- 3. Add credit/debit/order_id columns to worker_transactions if missing
      ALTER TABLE worker_transactions 
      ADD COLUMN IF NOT EXISTS credit DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS debit DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL;

      -- 4. Add item_code and category to inventory if missing
      ALTER TABLE inventory ADD COLUMN IF NOT EXISTS item_code VARCHAR(100);
      
      -- 5. Add shop_name to clients
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255);

      -- 6. Migrate existing data in transactions (if any)
      UPDATE client_transactions SET 
        credit = CASE WHEN transaction_type = 'Credit' THEN amount ELSE 0 END,
        debit = CASE WHEN transaction_type = 'Debit' THEN amount ELSE 0 END
      WHERE credit = 0 AND debit = 0;

      UPDATE worker_transactions SET 
        credit = CASE WHEN transaction_type = 'Credit' THEN amount ELSE 0 END,
        debit = CASE WHEN transaction_type = 'Debit' THEN amount ELSE 0 END
      WHERE credit = 0 AND debit = 0;
    `);

    console.log('SUCCESS: Database Schema Fixed!');
  } catch (err) {
    console.error('Error during fix:', err.message);
  } finally {
    await pool.end();
  }
}

fix();

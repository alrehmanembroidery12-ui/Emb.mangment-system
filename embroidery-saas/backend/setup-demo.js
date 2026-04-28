const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  try {
    console.log('Applying database changes for Demo Mode...');
    
    await pool.query(`
      ALTER TABLE factories 
      ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_readonly BOOLEAN DEFAULT FALSE;

      ALTER TABLE inventory ADD COLUMN IF NOT EXISTS item_code VARCHAR(100);

      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id SERIAL PRIMARY KEY,
        factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
        quantity DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(50) CHECK (transaction_type IN ('In', 'Out')),
        description TEXT,
        bill_amount DECIMAL(10, 2) DEFAULT 0.00,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS client_transactions (
        id SERIAL PRIMARY KEY,
        factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(50) CHECK (transaction_type IN ('Credit', 'Debit')),
        description TEXT,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Success: is_demo and is_readonly columns added to factories table.');
    
    // Optional: Ask if they want to create a demo account
    console.log('\nTo mark a factory as a Demo, run:');
    console.log("UPDATE factories SET is_demo = TRUE WHERE name = 'Your Factory Name';");
    
  } catch (err) {
    console.error('Error during setup:', err.message);
  } finally {
    await pool.end();
  }
}

setup();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createDemo() {
  try {
    console.log('Creating Rich Demo Account...');
    
    // 1. Create Demo Factory
    const factoryRes = await pool.query(
      "INSERT INTO factories (name, is_demo, is_readonly) VALUES ($1, $2, $3) RETURNING id",
      ['AA Embroidery Demo', true, false]
    );
    const factoryId = factoryRes.rows[0].id;

    // 2. Create Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    await pool.query(
      "INSERT INTO users (full_name, email, password, role, factory_id) VALUES ($1, $2, $3, $4, $5)",
      ['Demo Admin', 'demo@aa.com', hashedPassword, 'Admin', factoryId]
    );

    console.log('\nSuccess!');
    console.log('Factory: AA Embroidery Demo');
    console.log('Email: demo@aa.com');
    console.log('Password: demo123');
    console.log('\nNow please run the Reset button in the UI (after logging in) to seed the rich data.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

createDemo();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testUpdate() {
  try {
    console.log('Testing Factory Profile Update...');
    const name = 'AA Embroidery Demo (Updated)';
    const address = 'Test Address';
    const contact_phone = '123456789';
    const factory_id = 3;

    const result = await pool.query(
      'UPDATE factories SET name = $1, address = $2, contact_phone = $3 WHERE id = $4 RETURNING *',
      [name, address, contact_phone, factory_id]
    );
    
    console.log('Update Result:');
    console.table(result.rows);
  } catch (err) {
    console.error('Update Failed:', err.message);
  } finally {
    await pool.end();
  }
}

testUpdate();

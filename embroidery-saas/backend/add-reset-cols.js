const db = require('./src/config/db');

async function addResetColumns() {
    try {
        console.log('Adding reset_password_token and reset_password_expires to users table...');
        
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP
        `);

        console.log('Database updated successfully for Password Reset!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
}

addResetColumns();

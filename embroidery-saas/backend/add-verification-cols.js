const db = require('./src/config/db');

async function updateSchema() {
    try {
        console.log('Adding is_verified and verification_token to users table...');
        
        // 1. Add is_verified column
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
        `);

        // 2. Add verification_token column
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)
        `);

        // 3. Mark existing users as verified (so they don't get locked out)
        await db.query(`
            UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL OR is_verified = FALSE
        `);
        
        console.log('Database updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
}

updateSchema();

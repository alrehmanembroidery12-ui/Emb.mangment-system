const db = require('./src/config/db');

async function updateRoles() {
    try {
        console.log('Updating roles check constraint...');
        
        // 1. Drop existing constraint if possible (we might need to find its name)
        // Usually it's users_role_check
        await db.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        
        // 2. Add new constraint with 'Accountant'
        await db.query(`
            ALTER TABLE users 
            ADD CONSTRAINT users_role_check 
            CHECK (role IN ('Admin', 'Accountant', 'Operator'))
        `);
        
        console.log('Roles updated successfully: Admin, Accountant, Operator');
        
        // 3. Verify
        const res = await db.query('SELECT role FROM users LIMIT 1');
        console.log('Current roles in DB:', res.rows);
        
        process.exit(0);
    } catch (err) {
        console.error('Error updating roles:', err);
        process.exit(1);
    }
}

updateRoles();

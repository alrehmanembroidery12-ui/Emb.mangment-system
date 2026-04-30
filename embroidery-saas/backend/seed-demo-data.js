const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
    const factory_id = 3; // The ID we found
    try {
        console.log('Starting data seeding for Factory ID:', factory_id);
        
        await pool.query('BEGIN');

        // 1. Mark factory as demo
        await pool.query('UPDATE factories SET is_demo = TRUE, name = $1 WHERE id = $2', ['AA Embroidery Demo', factory_id]);

        // 2. Clear existing data for this factory
        const tables = [
            'payments', 'invoices', 'machine_logs', 'worker_transactions', 
            'client_transactions', 'attendance', 'orders', 'inventory', 
            'machines', 'workers', 'clients'
        ];

        for (const table of tables) {
            try {
                await pool.query(`DELETE FROM ${table} WHERE factory_id = $1`, [factory_id]);
                console.log(`Cleared ${table}`);
            } catch (e) { console.warn(`Skip ${table}: ${e.message}`); }
        }

        // 3. Seed Clients (10)
        const clientNames = [
            'Global Garments', 'Elite Fashion', 'Urban Stitch', 'Nexus Textiles', 
            'Royal Boutique', 'Prime Apparels', 'Style Hub', 'Cotton World', 
            'Velvet Vogue', 'Legacy Knits'
        ];
        const clientIds = [];
        for (let i = 0; i < clientNames.length; i++) {
            const res = await pool.query(
                'INSERT INTO clients (factory_id, name, shop_name, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [factory_id, clientNames[i], `${clientNames[i]} Shop`, `contact@${clientNames[i].toLowerCase().replace(' ', '')}.com`, `+92-300-${1000000 + i}`, `${i + 10} Industrial Area, Karachi`]
            );
            clientIds.push(res.rows[0].id);
        }
        console.log('Seeded 10 Clients');

        // 4. Seed Workers (20)
        const workerNames = [
            'Ahmed Ali', 'Bilal Khan', 'Hamza Sheikh', 'Zeeshan Raza', 'Umar Farooq',
            'Sajid Hussain', 'Kashif Mehmood', 'Asif Iqbal', 'Nasir Jamshed', 'Fahad Mustafa',
            'Kamran Akmal', 'Shoaib Malik', 'Babar Azam', 'Rizwan Ahmed', 'Shaheen Shah',
            'Haris Rauf', 'Shadab Khan', 'Imad Wasim', 'Azhar Ali', 'Fawad Alam'
        ];
        const workerIds = [];
        for (let i = 0; i < workerNames.length; i++) {
            const salaryType = i % 2 === 0 ? 'Fixed' : 'Piece-rate';
            const baseSalary = salaryType === 'Fixed' ? 25000 + (i * 500) : 0;
            const res = await pool.query(
                'INSERT INTO workers (factory_id, name, phone, salary_type, base_salary) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [factory_id, workerNames[i], `+92-321-${2000000 + i}`, salaryType, baseSalary]
            );
            workerIds.push(res.rows[0].id);
            
            // Add transactions
            if (i < 10) {
                await pool.query('INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, credit, debit) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                    [factory_id, res.rows[0].id, 2000 + (i * 100), 'Credit', 'Performance Bonus', 2000 + (i * 100), 0]);
                await pool.query('INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description, credit, debit) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                    [factory_id, res.rows[0].id, 5000, 'Debit', 'Salary Advance', 0, 5000]);
            }
        }
        console.log('Seeded 20 Workers');

        // 5. Seed Machines (4)
        const machines = [
            { name: 'Machine 01 - Tajima', model: 'TMBR-S1501C' },
            { name: 'Machine 02 - Barudan', model: 'BEXT-S1501C' },
            { name: 'Machine 03 - SWF', model: 'K-UH1501-45' },
            { name: 'Machine 04 - Ricoma', model: 'MT-1501' }
        ];
        for (const m of machines) {
            await pool.query(
                'INSERT INTO machines (factory_id, name, model_number, total_heads, status) VALUES ($1, $2, $3, $4, $5)',
                [factory_id, m.name, m.model, 1, 'Active']
            );
        }
        console.log('Seeded 4 Machines');

        // 6. Client Ledger
        const mainClientId = clientIds[0];
        const ledger = [
            { type: 'Debit', amount: 250000, desc: 'Bill for Order #ORD-101 (500 Suits)' },
            { type: 'Credit', amount: 100000, desc: 'Bank Transfer (Meezan Bank)' },
            { type: 'Debit', amount: 120000, desc: 'Bill for Order #ORD-102 (300 Suits)' },
            { type: 'Credit', amount: 80000, desc: 'Cash Payment Received' },
            { type: 'Credit', amount: 40000, desc: 'Online Transfer' }
        ];
        for (const e of ledger) {
            await pool.query(
                'INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, credit, debit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [factory_id, mainClientId, null, e.amount, e.type, e.desc, e.type === 'Credit' ? e.amount : 0, e.type === 'Debit' ? e.amount : 0]
            );
        }
        console.log('Seeded Client Ledger');

        // 7. Inventory
        const inventoryItems = [
            { name: 'White Thread - High Quality', code: 'TH-001', cat: 'Thread', qty: 150, unit: 'Rolls', min: 20 },
            { name: 'Black Thread - Standard', code: 'TH-002', cat: 'Thread', qty: 15, unit: 'Rolls', min: 25 },
            { name: 'Golden Zari Thread', code: 'TH-003', cat: 'Thread', qty: 45, unit: 'Rolls', min: 10 }
        ];
        for (const item of inventoryItems) {
            const invRes = await pool.query(
                'INSERT INTO inventory (factory_id, item_name, item_code, category, quantity, unit, min_stock_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [factory_id, item.name, item.code, item.cat, item.qty, item.unit, item.min]
            );
            await pool.query(
                'INSERT INTO inventory_transactions (factory_id, item_id, quantity, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
                [factory_id, invRes.rows[0].id, item.qty + 50, 'In', 'Initial Purchase']
            );
        }
        console.log('Seeded Inventory');

        // 8. Orders & Billing
        const ts = Date.now().toString().slice(-4);
        for (let i = 1; i <= 8; i++) {
            const cId = clientIds[i % 10];
            const price = 40000 + (i * 12000);
            const orderRes = await pool.query(
                'INSERT INTO orders (factory_id, client_id, order_number, status, total_price, due_date, fabric_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [factory_id, cId, `ORD-D${ts}-${i}`, i % 2 === 0 ? 'Completed' : 'In-Production', price, '2026-12-25', 100 + (i * 10)]
            );
            const orderId = orderRes.rows[0].id;

            // Add to Ledger (Debit)
            await pool.query('INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, debit) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [factory_id, cId, orderId, price, 'Debit', `Invoice for Order ORD-D${ts}-${i}`, price]);

            // Create Invoice
            const invRes = await pool.query(
                'INSERT INTO invoices (factory_id, order_id, invoice_number, total_amount, tax_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [factory_id, orderId, `INV-D${ts}-${i}`, price, price * 0.05, i % 2 === 0 ? 'Paid' : 'Partially-Paid']
            );
            const invoiceId = invRes.rows[0].id;

            // Create Payment (Credit)
            const payAmount = i % 2 === 0 ? price : price * 0.4;
            await pool.query('INSERT INTO payments (factory_id, invoice_id, amount, payment_method) VALUES ($1, $2, $3, $4)',
                [factory_id, invoiceId, payAmount, 'Bank Transfer']);
            
            await pool.query('INSERT INTO client_transactions (factory_id, client_id, order_id, amount, transaction_type, description, credit) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [factory_id, cId, orderId, payAmount, 'Credit', `Payment for Invoice INV-D${ts}-${i}`, payAmount]);
        }
        console.log('Seeded 8 Orders and Invoices');

        await pool.query('COMMIT');
        console.log('SUCCESS: All Demo Data Seeded!');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
}
seed();

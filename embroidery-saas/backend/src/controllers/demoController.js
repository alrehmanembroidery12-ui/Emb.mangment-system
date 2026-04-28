const db = require('../config/db');

exports.resetDemoData = async (req, res) => {
  const { factory_id, is_demo } = req.user;

  if (!is_demo) {
    return res.status(403).json({ message: 'Reset functionality is only available for demo accounts.' });
  }

  try {
    // Start Transaction
    await db.query('BEGIN');

    // 1. Clear existing data
    const tables = [
      'payments', 'invoices', 'machine_logs', 'worker_transactions', 
      'client_transactions', 'attendance', 'orders', 'inventory', 
      'machines', 'workers', 'clients'
    ];

    for (const table of tables) {
      try {
        await db.query(`DELETE FROM ${table} WHERE factory_id = $1`, [factory_id]);
      } catch (e) { console.warn(`Skip ${table}`); }
    }

    // 2. Seed Data
    const ts = Date.now().toString().slice(-4);
    
    // 10 Clients (Parties)
    const clientNames = [
      'Global Garments', 'Elite Fashion', 'Urban Stitch', 'Nexus Textiles', 
      'Royal Boutique', 'Prime Apparels', 'Style Hub', 'Cotton World', 
      'Velvet Vogue', 'Legacy Knits'
    ];
    const clientIds = [];
    for (let i = 0; i < clientNames.length; i++) {
      const res = await db.query(
        'INSERT INTO clients (factory_id, name, shop_name, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [factory_id, clientNames[i], `${clientNames[i]} Shop`, `contact@${clientNames[i].toLowerCase().replace(' ', '')}.com`, `+92-300-${1000000 + i}`, `${i + 10} Industrial Area, Karachi`]
      );
      clientIds.push(res.rows[0].id);
    }

    // 20 Workers
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
      const res = await db.query(
        'INSERT INTO workers (factory_id, name, phone, salary_type, base_salary) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [factory_id, workerNames[i], `+92-321-${2000000 + i}`, salaryType, baseSalary]
      );
      workerIds.push(res.rows[0].id);
      
      // Add some varied transactions for each worker
      if (i < 10) {
          await db.query('INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)', 
            [factory_id, res.rows[0].id, 2000 + (i * 100), 'Credit', 'Performance Bonus']);
          await db.query('INSERT INTO worker_transactions (factory_id, worker_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)', 
            [factory_id, res.rows[0].id, 5000, 'Debit', 'Salary Advance']);
      }
    }

    // 4 Machines
    const machines = [
      { name: 'Machine 01 - Tajima', model: 'TMBR-S1501C' },
      { name: 'Machine 02 - Barudan', model: 'BEXT-S1501C' },
      { name: 'Machine 03 - SWF', model: 'K-UH1501-45' },
      { name: 'Machine 04 - Ricoma', model: 'MT-1501' }
    ];
    const machineIds = [];
    for (const m of machines) {
      const res = await db.query(
        'INSERT INTO machines (factory_id, name, model_number, total_heads, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [factory_id, m.name, m.model, 1, 'Active']
      );
      machineIds.push(res.rows[0].id);
    }

    // Client Ledger (Detailed for Global Garments)
    const mainClientId = clientIds[0];
    const ledger = [
        { type: 'Debit', amount: 250000, desc: 'Bill for Order #ORD-101 (500 Suits)' },
        { type: 'Credit', amount: 100000, desc: 'Bank Transfer (Meezan Bank)' },
        { type: 'Debit', amount: 120000, desc: 'Bill for Order #ORD-102 (300 Suits)' },
        { type: 'Credit', amount: 80000, desc: 'Cash Payment Received' },
        { type: 'Credit', amount: 40000, desc: 'Online Transfer' },
        { type: 'Debit', amount: 15000, desc: 'Extra Threading Charges' },
        { type: 'Debit', amount: 55000, desc: 'Bill for Order #ORD-105' }
    ];
    for (const e of ledger) {
        await db.query(
            'INSERT INTO client_transactions (factory_id, client_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
            [factory_id, mainClientId, e.amount, e.type, e.desc]
        );
    }

    // Inventory Items (Rich Data)
    const inventoryItems = [
      { name: 'White Thread - High Quality', code: 'TH-001', cat: 'Thread', qty: 150, unit: 'Rolls', min: 20 },
      { name: 'Black Thread - Standard', code: 'TH-002', cat: 'Thread', qty: 15, unit: 'Rolls', min: 25 }, // Low stock
      { name: 'Golden Zari Thread', code: 'TH-003', cat: 'Thread', qty: 45, unit: 'Rolls', min: 10 },
      { name: 'Cotton Fabric - Sky Blue', code: 'FB-001', cat: 'Fabric', qty: 300, unit: 'Meters', min: 50 },
      { name: 'Organza Fabric - White', code: 'FB-002', cat: 'Fabric', qty: 8, unit: 'Meters', min: 15 }, // Low stock
      { name: 'Needles - Size 14', code: 'ND-001', cat: 'Needles', qty: 120, unit: 'Pcs', min: 50 }
    ];

    for (const item of inventoryItems) {
      const invRes = await db.query(
        'INSERT INTO inventory (factory_id, item_name, item_code, category, quantity, unit, min_stock_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [factory_id, item.name, item.code, item.cat, item.qty, item.unit, item.min]
      );
      const itemId = invRes.rows[0].id;

      // Add transactions to show history (Total vs Remaining logic)
      await db.query(
          'INSERT INTO inventory_transactions (factory_id, item_id, quantity, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
          [factory_id, itemId, item.qty + 50, 'In', 'Initial Purchase']
      );
      await db.query(
          'INSERT INTO inventory_transactions (factory_id, item_id, quantity, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
          [factory_id, itemId, 50, 'Out', 'Consumption for Orders']
      );
    }

    // Orders & Billing
    for (let i = 1; i <= 8; i++) {
        const cId = clientIds[i % 10];
        const price = 40000 + (i * 12000);
        const orderRes = await db.query(
          'INSERT INTO orders (factory_id, client_id, order_number, status, total_price, due_date, fabric_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [factory_id, cId, `ORD-D${ts}-${i}`, i % 2 === 0 ? 'Completed' : 'In-Production', price, '2024-12-25', 100 + (i * 10)]
        );
        const orderId = orderRes.rows[0].id;

        // Add to Ledger (Debit)
        await db.query('INSERT INTO client_transactions (factory_id, client_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
            [factory_id, cId, price, 'Debit', `Invoice for Order ORD-D${ts}-${i}`]);

        // Create Invoice
        const invRes = await db.query(
            'INSERT INTO invoices (factory_id, order_id, invoice_number, total_amount, tax_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [factory_id, orderId, `INV-D${ts}-${i}`, price, price * 0.05, i % 2 === 0 ? 'Paid' : 'Partially-Paid']
        );
        const invoiceId = invRes.rows[0].id;

        // Create Payment (Credit)
        const payAmount = i % 2 === 0 ? price : price * 0.4;
        await db.query('INSERT INTO payments (factory_id, invoice_id, amount, payment_method) VALUES ($1, $2, $3, $4)',
            [factory_id, invoiceId, payAmount, 'Bank Transfer']);
        
        await db.query('INSERT INTO client_transactions (factory_id, client_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
            [factory_id, cId, payAmount, 'Credit', `Payment for Invoice INV-D${ts}-${i}`]);
    }

    // Commit
    await db.query('COMMIT');
    res.json({ message: 'Professional Demo Data Seeded! 20 Workers, 4 Machines, 10 Clients and Detailed Ledger ready.' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};

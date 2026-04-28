const db = require('../config/db');
const PDFDocument = require('pdfkit');

// Create Invoice for an Order
exports.createInvoice = async (req, res) => {
  const { order_id, invoice_number, tax_amount } = req.body;
  try {
    // Get Order Details
    const orderResult = await db.query('SELECT total_price FROM orders WHERE id = $1 AND factory_id = $2', [order_id, req.user.factory_id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    
    const total_amount = parseFloat(orderResult.rows[0].total_price) + (parseFloat(tax_amount) || 0);

    const result = await db.query(
      `INSERT INTO invoices (factory_id, order_id, invoice_number, total_amount, tax_amount, status) 
       VALUES ($1, $2, $3, $4, $5, 'Unpaid') RETURNING *`,
      [req.user.factory_id, order_id, invoice_number, total_amount, tax_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Record Payment and Auto-Update Status
exports.recordPayment = async (req, res) => {
  const { invoice_id, amount, payment_method } = req.body;
  try {
    // 1. Record Payment
    await db.query(
      'INSERT INTO payments (factory_id, invoice_id, amount, payment_method) VALUES ($1, $2, $3, $4)',
      [req.user.factory_id, invoice_id, amount, payment_method]
    );

    // 2. Get Total Paid for this Invoice
    const paidResult = await db.query('SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = $1', [invoice_id]);
    const total_paid = parseFloat(paidResult.rows[0].total_paid);

    // 3. Get Invoice Total
    const invoiceResult = await db.query('SELECT total_amount FROM invoices WHERE id = $1', [invoice_id]);
    const total_amount = parseFloat(invoiceResult.rows[0].total_amount);

    // 4. Update Status
    let status = 'Partially-Paid';
    if (total_paid >= total_amount) status = 'Paid';
    if (total_paid === 0) status = 'Unpaid';

    await db.query('UPDATE invoices SET status = $1 WHERE id = $2', [status, invoice_id]);

    res.json({ message: 'Payment recorded', status, total_paid, balance: total_amount - total_paid });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Generate and Export PDF
exports.exportInvoicePDF = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT i.*, o.order_number, c.name as client_name, c.address as client_address, f.name as factory_name 
       FROM invoices i 
       JOIN orders o ON i.order_id = o.id 
       JOIN clients c ON o.client_id = c.id 
       JOIN factories f ON i.factory_id = f.id 
       WHERE i.id = $1 AND i.factory_id = $2`,
      [id, req.user.factory_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = result.rows[0];

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoice_number}.pdf`);

    doc.pipe(res);

    // PDF Content
    doc.fontSize(25).text(invoice.factory_name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`INVOICE: ${invoice.invoice_number}`, { underline: true });
    doc.fontSize(12).text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Bill To: ${invoice.client_name}`);
    doc.text(`Address: ${invoice.client_address}`);
    doc.moveDown();
    doc.text('--------------------------------------------------');
    doc.text(`Order Number: ${invoice.order_number}`);
    doc.text(`Total Amount: ₨ ${invoice.total_amount}`);
    doc.text(`Tax Amount: ₨ ${invoice.tax_amount}`);
    doc.text(`Status: ${invoice.status}`);
    doc.text('--------------------------------------------------');
    doc.moveDown();
    doc.fontSize(10).text('Thank you for your business!', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

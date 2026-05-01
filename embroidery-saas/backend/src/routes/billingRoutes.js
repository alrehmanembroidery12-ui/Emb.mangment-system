const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/invoice', authMiddleware, authorizeRoles('Admin', 'Accountant'), billingController.createInvoice);
router.post('/payment', authMiddleware, authorizeRoles('Admin', 'Accountant'), billingController.recordPayment);
router.get('/invoice/:id/pdf', authMiddleware, authorizeRoles('Admin', 'Accountant'), billingController.exportInvoicePDF);

module.exports = router;

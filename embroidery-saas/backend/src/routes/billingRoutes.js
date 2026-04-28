const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/invoice', authMiddleware, billingController.createInvoice);
router.post('/payment', authMiddleware, billingController.recordPayment);
router.get('/invoice/:id/pdf', authMiddleware, billingController.exportInvoicePDF);

module.exports = router;

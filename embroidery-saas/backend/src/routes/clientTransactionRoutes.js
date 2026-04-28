const express = require('express');
const router = express.Router();
const clientTransactionController = require('../controllers/clientTransactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, clientTransactionController.addClientTransaction);
router.get('/:client_id', authMiddleware, clientTransactionController.getClientTransactions);

module.exports = router;

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, transactionController.addTransaction);
router.get('/:worker_id', authMiddleware, transactionController.getWorkerTransactions);
router.get('/:worker_id/summary', authMiddleware, transactionController.getWorkerSummary);

module.exports = router;

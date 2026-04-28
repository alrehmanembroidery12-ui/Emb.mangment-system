const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, orderController.getOrders);
router.get('/overdue', authMiddleware, orderController.getOverdueOrders);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;

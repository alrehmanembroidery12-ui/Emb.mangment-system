const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, inventoryController.getInventory);
router.post('/', authMiddleware, inventoryController.addItem);
router.put('/:id', authMiddleware, inventoryController.updateItem);
router.post('/transaction', authMiddleware, inventoryController.logTransaction);
router.get('/history/:id', authMiddleware, inventoryController.getItemHistory);

module.exports = router;

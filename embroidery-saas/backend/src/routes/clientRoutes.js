const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, clientController.getClients);
router.post('/', authMiddleware, clientController.addClient);

module.exports = router;

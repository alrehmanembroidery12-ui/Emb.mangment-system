const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, machineController.addMachine);
router.post('/log', authMiddleware, machineController.logProduction);
router.get('/:machine_id/stats', authMiddleware, machineController.getMachineStats);

module.exports = router;

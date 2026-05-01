const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, machineController.getMachines);
router.post('/', authMiddleware, machineController.addMachine);
router.put('/:id', authMiddleware, machineController.updateMachine);
router.delete('/:id', authMiddleware, machineController.deleteMachine);
router.post('/log', authMiddleware, machineController.logProduction);
router.get('/:machine_id/stats', authMiddleware, machineController.getMachineStats);

module.exports = router;

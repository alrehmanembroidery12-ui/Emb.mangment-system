const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/client', authMiddleware, authorizeRoles('Admin', 'Accountant', 'Operator'), reportController.getClientReport);
router.get('/factory', authMiddleware, authorizeRoles('Admin', 'Accountant', 'Operator'), reportController.getFactoryReport);
router.get('/machine', authMiddleware, authorizeRoles('Admin', 'Accountant', 'Operator'), reportController.getMachineReport);

module.exports = router;

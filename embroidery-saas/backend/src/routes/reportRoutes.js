const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/client', authMiddleware, authorizeRoles('Admin', 'Accountant'), reportController.getClientReport);
router.get('/factory', authMiddleware, authorizeRoles('Admin', 'Accountant'), reportController.getFactoryReport);
router.get('/machine', authMiddleware, authorizeRoles('Admin', 'Accountant'), reportController.getMachineReport);

module.exports = router;

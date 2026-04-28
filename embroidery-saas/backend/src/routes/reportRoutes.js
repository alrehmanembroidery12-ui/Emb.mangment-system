const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/client', authMiddleware, reportController.getClientReport);
router.get('/factory', authMiddleware, reportController.getFactoryReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/reset', authMiddleware, demoController.resetDemoData);

module.exports = router;

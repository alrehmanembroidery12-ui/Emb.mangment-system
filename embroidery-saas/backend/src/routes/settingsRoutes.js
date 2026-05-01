const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/bonus-rules', authMiddleware, settingsController.getBonusRules);
router.post('/bonus-rules', authMiddleware, settingsController.updateBonusRules);

module.exports = router;

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/bonus-rules', authMiddleware, settingsController.getBonusRules);
router.post('/bonus-rules', authMiddleware, settingsController.updateBonusRules);

router.get('/profile', authMiddleware, settingsController.getFactoryProfile);
router.post('/profile', authMiddleware, settingsController.updateFactoryProfile);

router.get('/users', authMiddleware, settingsController.getUsers);
router.post('/users', authMiddleware, settingsController.addUser);
router.delete('/users/:id', authMiddleware, settingsController.deleteUser);

router.get('/export', authMiddleware, settingsController.exportAllData);
router.post('/import', authMiddleware, settingsController.importData);

module.exports = router;

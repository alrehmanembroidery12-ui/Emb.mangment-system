const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/bonus-rules', authMiddleware, authorizeRoles('Admin'), settingsController.getBonusRules);
router.post('/bonus-rules', authMiddleware, authorizeRoles('Admin'), settingsController.updateBonusRules);

router.get('/profile', authMiddleware, authorizeRoles('Admin'), settingsController.getFactoryProfile);
router.post('/profile', authMiddleware, authorizeRoles('Admin'), settingsController.updateFactoryProfile);

router.get('/users', authMiddleware, authorizeRoles('Admin'), settingsController.getUsers);
router.post('/users', authMiddleware, authorizeRoles('Admin'), settingsController.addUser);
router.delete('/users/:id', authMiddleware, authorizeRoles('Admin'), settingsController.deleteUser);

router.get('/export', authMiddleware, authorizeRoles('Admin'), settingsController.exportAllData);
router.post('/import', authMiddleware, authorizeRoles('Admin'), settingsController.importData);

module.exports = router;

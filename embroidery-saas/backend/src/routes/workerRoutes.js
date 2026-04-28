const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, workerController.getWorkers);
router.post('/', authMiddleware, workerController.addWorker);
router.put('/:id', authMiddleware, workerController.updateWorker);

module.exports = router;

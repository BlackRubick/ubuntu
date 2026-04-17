const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middlewares/auth');

// ADMIN, DIRECTOR pueden ver estadísticas
router.get('/', authenticate, authorize('ADMIN', 'DIRECTOR'), statsController.getStats);

module.exports = router;

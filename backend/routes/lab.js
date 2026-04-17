const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticate, authorize } = require('../middlewares/auth');

// ADMIN, MEDICO pueden solicitar; LABORATORIO ve y actualiza
router.post('/', authenticate, authorize('ADMIN', 'MEDICO'), labController.createLabRequest);
router.get('/', authenticate, authorize('ADMIN', 'MEDICO', 'LABORATORIO', 'DIRECTOR'), labController.getLabRequests);
router.put('/:id/status', authenticate, authorize('ADMIN', 'LABORATORIO', 'MEDICO'), labController.updateLabRequestStatus);

module.exports = router;

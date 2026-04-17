const express = require('express');
const router = express.Router();
const labResultController = require('../controllers/labResultController');
const uploadResult = require('../middlewares/uploadResult');
const { authenticate, authorize } = require('../middlewares/auth');

// LABORATORIO sube resultados, MEDICO y ADMIN pueden ver
router.post('/', authenticate, authorize('LABORATORIO'), uploadResult.single('file'), labResultController.createLabResult);
router.get('/', authenticate, authorize('ADMIN', 'MEDICO', 'LABORATORIO', 'DIRECTOR'), labResultController.getLabResults);
router.get('/:id', authenticate, authorize('ADMIN', 'MEDICO', 'LABORATORIO'), labResultController.getLabResult);

module.exports = router;

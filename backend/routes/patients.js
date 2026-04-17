const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middlewares/auth');

// ADMIN, MEDICO pueden crear/editar; DIRECTOR solo lectura
router.post('/', authenticate, authorize('ADMIN', 'MEDICO'), patientController.createPatient);
router.get('/', authenticate, authorize('ADMIN', 'MEDICO', 'DIRECTOR', 'LABORATORIO'), patientController.getPatients);
router.get('/:id', authenticate, authorize('ADMIN', 'MEDICO', 'DIRECTOR', 'LABORATORIO'), patientController.getPatient);
router.put('/:id', authenticate, authorize('ADMIN', 'MEDICO'), patientController.updatePatient);
router.delete('/:id', authenticate, authorize('ADMIN'), patientController.deletePatient);

module.exports = router;

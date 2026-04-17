const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middlewares/auth');

// ADMIN, MEDICO pueden crear/editar; DIRECTOR solo lectura
router.post('/', authenticate, authorize('ADMIN', 'MEDICO'), medicalRecordController.createMedicalRecord);
router.get('/', authenticate, authorize('ADMIN', 'MEDICO', 'DIRECTOR'), medicalRecordController.getMedicalRecords);
router.get('/:id', authenticate, authorize('ADMIN', 'MEDICO', 'DIRECTOR'), medicalRecordController.getMedicalRecord);
router.put('/:id', authenticate, authorize('ADMIN', 'MEDICO'), medicalRecordController.updateMedicalRecord);
router.post('/:id/notes', authenticate, authorize('ADMIN', 'MEDICO'), medicalRecordController.addNote);

// Exportar expediente clínico a .txt (ADMIN, MEDICO)
router.get('/:id/export', authenticate, authorize('ADMIN', 'MEDICO'), medicalRecordController.exportMedicalRecord);

module.exports = router;

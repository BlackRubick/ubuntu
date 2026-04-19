const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticate, authorize } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const pdfController = require('../controllers/pdfController');
// Exportar expediente médico (solo MEDICO, ADMIN)
router.get('/export/:id', authenticate, authorize('ADMIN', 'MEDICO'), fileController.exportMedicalRecord);
// Exportar expediente médico en PDF (solo MEDICO, ADMIN)
router.get('/export-pdf/:id', authenticate, authorize('ADMIN', 'MEDICO'), pdfController.exportMedicalRecordPdf);
// Exportar resultado de laboratorio individual (solo MEDICO, ADMIN)
router.get('/export-lab/:id', authenticate, authorize('ADMIN', 'MEDICO'), fileController.exportLabResult);
// Importar expediente (solo ADMIN)
router.post('/import', authenticate, authorize('ADMIN'), upload.single('file'), fileController.importMedicalRecord);

module.exports = router;

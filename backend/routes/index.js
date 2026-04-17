const express = require('express');
const router = express.Router();


const authRoutes = require('./auth');
const userRoutes = require('./users');
const patientRoutes = require('./patients');
const medicalRecordRoutes = require('./medicalRecords');
const labRoutes = require('./lab');
const labResultRoutes = require('./labResults');
const statsRoutes = require('./stats');
const fileRoutes = require('./files');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/lab', labRoutes);
router.use('/results', labResultRoutes);
router.use('/stats', statsRoutes);
router.use('/files', fileRoutes);
// router.use('/medical-records', ...);
// router.use('/lab', ...);
// router.use('/results', ...);
// router.use('/stats', ...);
// router.use('/files', ...);

module.exports = router;

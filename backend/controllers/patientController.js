const { Patient, MedicalRecord } = require('../models');

exports.createPatient = async (req, res, next) => {
  try {
    // Validar NSS único
    const exists = await Patient.findOne({ where: { nss: req.body.nss } });
    if (exists) {
      return res.status(400).json({ message: 'El NSS ya está registrado para otro paciente.' });
    }
    const patient = await Patient.create(req.body);
    // Crear expediente clínico automáticamente
    const medicalRecord = await MedicalRecord.create({ patientId: patient.id });
    res.status(201).json({ patient, medicalRecord });
  } catch (err) {
    next(err);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const { q } = req.query;
    const where = q ? { name: { [require('sequelize').Op.like]: `%${q}%` } } : {};
    const patients = await Patient.findAll({ where, include: MedicalRecord });
    res.json(patients);
  } catch (err) {
    next(err);
  }
};

exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
    await patient.update(req.body);
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
    await patient.destroy();
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    next(err);
  }
};

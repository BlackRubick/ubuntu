const fs = require('fs');
const path = require('path');
// Exportar información clínica a .txt
exports.exportMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, { include: Patient });
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    const patient = record.Patient;
    let content = '';
    content += `Nombre: ${patient.name}\n`;
    content += `Edad: ${patient.age}\n`;
    content += `Sexo: ${patient.sex}\n`;
    content += `Dirección: ${patient.address}\n`;
    content += `Teléfono: ${patient.phone}\n`;
    content += `NSS: ${patient.nss}\n`;
    content += `Estado civil: ${patient.marital_status}\n`;
    content += `Fecha de ingreso: ${patient.admission_date ? patient.admission_date.toISOString().split('T')[0] : ''}\n`;
    content += `Motivo de consulta: ${record.reason}\n`;
    content += `Diagnóstico: ${record.diagnosis}\n`;
    content += `Tratamiento: ${record.treatment}\n`;
    content += `Notas: ${record.notes || ''}\n`;

    // Opcional: nombre de archivo personalizado
    const filename = `expediente_${patient.name.replace(/\s+/g, '_')}_${patient.id}.txt`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (err) {
    next(err);
  }
};
const { MedicalRecord, Patient } = require('../models');

exports.createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, reason, diagnosis, treatment, notes } = req.body;
    const record = await MedicalRecord.create({ patientId, reason, diagnosis, treatment, notes });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

exports.getMedicalRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.findAll({ include: Patient });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.getMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, { include: Patient });
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    await record.update(req.body);
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.addNote = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    record.notas_clinicas = (record.notas_clinicas || '') + '\n' + req.body.note;
    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
};

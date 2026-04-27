const fs = require('fs');
const path = require('path');
// Exportar información clínica a .txt
exports.exportMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, { include: Patient });
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    const patient = record.Patient;
    let content = '';
    content += `Nombre: ${patient.nombres || ''} ${patient.primer_apellido || ''} ${patient.segundo_apellido || ''}\n`;
    content += `Sexo: ${patient.sexo || ''}\n`;
    content += `Dirección: ${patient.domicilio || ''}\n`;
    content += `Teléfono: ${patient.telefono || ''}\n`;
    content += `NSS: ${patient.nss || ''}\n`;
    content += `Estado civil: ${patient.estado_civil || ''}\n`;
    content += `Fecha de nacimiento: ${patient.fecha_nacimiento ? (typeof patient.fecha_nacimiento === 'string' ? patient.fecha_nacimiento.split('T')[0] : patient.fecha_nacimiento.toISOString().split('T')[0]) : ''}\n`;
    content += `Motivo de consulta: ${record.motivo_consulta || ''}\n`;
    content += `Diagnóstico: ${record.diagnostico || ''}\n`;
    content += `Tratamiento: ${record.tratamiento || ''}\n`;
    content += `Notas: ${record.notas_clinicas || ''}\n`;

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
    const { patientId, motivo_consulta, diagnostico, tratamiento, notas_clinicas } = req.body;
    const record = await MedicalRecord.create({ patientId, motivo_consulta, diagnostico, tratamiento, notas_clinicas });
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
    // El frontend envía { nota: ... }
    record.notas_clinicas = (record.notas_clinicas || '') + '\n' + req.body.nota;
    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.getMedicalRecordByPatient = async (req, res, next) => {
  try {
    let record = await MedicalRecord.findOne({
      where: { patientId: req.params.patientId },
      include: Patient
    });

    // 🔥 SI NO EXISTE → CREARLO AUTOMÁTICAMENTE
    if (!record) {
      record = await MedicalRecord.create({
        patientId: req.params.patientId,
        motivo_consulta: '',
        diagnostico: '',
        tratamiento: '',
        notas_clinicas: '',
      });

      // volver a traerlo con include
      record = await MedicalRecord.findByPk(record.id, {
        include: Patient
      });
    }

    res.json(record);
  } catch (err) {
    next(err);
  }
};



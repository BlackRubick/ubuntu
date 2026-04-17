
const fs = require('fs');
const { MedicalRecord, Patient, LabResult, LabRequest } = require('../models');

// Exportar expediente médico con nombre completo y análisis
exports.exportMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        {
          model: Patient
        },
        {
          model: LabRequest,
          include: [LabResult]
        }
      ]
    });
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    const p = record.Patient;
    const nombreCompleto = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();
    let fechaNacimiento = '';
    if (p.fecha_nacimiento) {
      if (typeof p.fecha_nacimiento === 'string') {
        fechaNacimiento = p.fecha_nacimiento.split('T')[0];
      } else if (p.fecha_nacimiento instanceof Date) {
        fechaNacimiento = p.fecha_nacimiento.toISOString().split('T')[0];
      } else {
        fechaNacimiento = String(p.fecha_nacimiento);
      }
    }
    let txt = `Paciente: ${nombreCompleto}\nNSS: ${p.nss || ''}\nSexo: ${p.sexo || ''}\nCURP: ${p.curp || ''}\nFecha de nacimiento: ${fechaNacimiento}\n`;
    txt += `Motivo de consulta: ${record.motivo_consulta || ''}\nDiagnóstico: ${record.diagnostico || ''}\nTratamiento: ${record.tratamiento || ''}\nNotas clínicas: ${record.notas_clinicas || ''}\n`;
    // Agregar análisis de laboratorio
    if (record.LabRequests && record.LabRequests.length > 0) {
      txt += `\n--- Resultados de Laboratorio ---\n`;
      for (const lab of record.LabRequests) {
        txt += `\nTipo: ${lab.type || ''}\nEstado: ${lab.status || ''}\n`;
        if (lab.LabResult) {
          txt += `Resultado: ${lab.LabResult.result || ''}\n`;
        } else {
          txt += `Resultado: Pendiente\n`;
        }
      }
    }
    res.setHeader('Content-Disposition', `attachment; filename=expediente_${nombreCompleto.replace(/ /g, '_')}.txt`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(txt);
  } catch (err) {
    next(err);
  }
};

// Exportar resultado de laboratorio individual
exports.exportLabResult = async (req, res, next) => {
  try {
    const result = await LabResult.findByPk(req.params.id, {
      include: [{
        model: LabRequest,
        include: [{
          model: MedicalRecord,
          include: [Patient]
        }]
      }]
    });
    if (!result) return res.status(404).json({ message: 'Resultado no encontrado' });
    const lab = result.LabRequest;
    const record = lab.MedicalRecord;
    const p = record.Patient;
    const nombreCompleto = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();
    let txt = `Paciente: ${nombreCompleto}\nSexo: ${p.sexo || ''}\nCURP: ${p.curp || ''}\nFecha de nacimiento: ${p.fecha_nacimiento ? p.fecha_nacimiento.toISOString().split('T')[0] : ''}\n`;
    txt += `\n--- Resultado de Laboratorio ---\n`;
    txt += `Tipo: ${lab.type || ''}\nEstado: ${lab.status || ''}\nResultado: ${result.result || ''}\n`;
    res.setHeader('Content-Disposition', `attachment; filename=labresult_${nombreCompleto.replace(/ /g, '_')}_${lab.type || ''}.txt`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(txt);
  } catch (err) {
    next(err);
  }
};

exports.importMedicalRecord = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });
    const content = fs.readFileSync(req.file.path, 'utf-8');
    // Aquí parsear el contenido y crear registro (simplificado)
    res.json({ content });
  } catch (err) {
    next(err);
  }
};

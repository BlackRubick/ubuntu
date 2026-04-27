
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
    if (!lab) return res.status(404).json({ message: 'Solicitud de laboratorio no encontrada para este resultado' });
    const record = lab.MedicalRecord;
    if (!record) return res.status(404).json({ message: 'Expediente clínico no encontrado para esta solicitud de laboratorio' });
    const p = record.Patient;
    if (!p) return res.status(404).json({ message: 'Paciente no encontrado para este expediente clínico' });

    // HL7 ORU^R01
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const formatDate = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const fechaMsg = formatDate(now);
    const fechaLab = lab.createdAt ? formatDate(new Date(lab.createdAt)) : fechaMsg;
    const fechaNac = p.fecha_nacimiento ? (typeof p.fecha_nacimiento === 'string' ? p.fecha_nacimiento.replace(/-/g, '').slice(0,8) : formatDate(new Date(p.fecha_nacimiento)).slice(0,8)) : '';
    const sexo = p.sexo && p.sexo[0] ? p.sexo[0].toUpperCase() : '';
    const nombre = `${p.nombres || ''}`.trim();
    const apellido = `${p.primer_apellido || ''}`.trim();
    const pacienteId = p.id ? `P${String(p.id).padStart(3, '0')}` : '';
    const labId = lab.id ? `LAB${String(lab.id).padStart(3, '0')}` : '';
    const msgId = `MSG${String(result.id).padStart(5, '0')}`;
    const tipoLab = lab.type || '';

    // MSH
    let hl7 = `MSH|^~\\&|SistemaLab|LaboratorioCentral|SistemaWeb|TuClinica|${fechaMsg}||ORU^R01|${msgId}|P|2.5.1\n`;
    // PID
    hl7 += `PID|1||${pacienteId}||Paciente^${nombre}||${fechaNac}|${sexo}\n`;
    // OBR
    hl7 += `OBR|1||${labId}|${tipoLab.slice(0,4).toUpperCase()}^${tipoLab}|||${fechaLab}\n`;

    // OBX: parsear result.result (espera JSON o string HL7)
    let obxLines = '';
    let parsed = null;
    try {
      parsed = typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
    } catch {
      parsed = null;
    }
    if (Array.isArray(parsed)) {
      // [{code, name, value, units, ref, flag, type}]
      parsed.forEach((item, idx) => {
        obxLines += `OBX|${idx+1}|${item.type||'NM'}|${item.code}^${item.name}||${item.value}||${item.units||''}|${item.ref||''}|${item.flag||'N'}|||F\n`;
      });
    } else {
      // Si no es JSON, poner todo como un solo OBX
      obxLines += `OBX|1|ST|RES^Resultado||${result.result}||||N|||F\n`;
    }
    hl7 += obxLines;

    res.setHeader('Content-Disposition', `attachment; filename=labresult_${pacienteId}_${labId}.txt`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(hl7);
  } catch (err) {
    next(err);
  }
};

exports.importMedicalRecord = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });
    const content = fs.readFileSync(req.file.path, 'utf-8');
    // Detectar si es HL7 ORU^R01
    if (/^MSH\|.*\nPID\|.*\nOBR\|/m.test(content)) {
      // Parsear HL7 simple (solo 1 resultado por archivo)
      const lines = content.split(/\r?\n/);
      let pid = {}, obr = {}, obx = [];
      lines.forEach(line => {
        const parts = line.split('|');
        if (parts[0] === 'PID') {
          pid = {
            pacienteId: parts[3]?.replace(/^P/, ''),
            nombre: parts[5]?.split('^')[1] || '',
            fecha_nacimiento: parts[7] || '',
            sexo: parts[8] || '',
          };
        } else if (parts[0] === 'OBR') {
          obr = {
            labId: parts[3]?.replace(/^LAB/, ''),
            type: parts[4]?.split('^')[1] || '',
          };
        } else if (parts[0] === 'OBX') {
          obx.push({
            code: parts[3]?.split('^')[0] || '',
            name: parts[3]?.split('^')[1] || '',
            value: parts[5] || '',
            units: parts[6] || '',
            ref: parts[7] || '',
            flag: parts[8] || '',
            type: parts[2] || 'NM',
          });
        }
      });
      // Buscar o crear paciente
      let patient = null;
      if (pid.pacienteId) {
        patient = await Patient.findByPk(pid.pacienteId);
      }
      if (!patient) {
        patient = await Patient.create({
          nombres: pid.nombre,
          sexo: pid.sexo,
          fecha_nacimiento: pid.fecha_nacimiento ? new Date(pid.fecha_nacimiento) : null,
        });
      }
      // Buscar o crear expediente
      let record = await MedicalRecord.findOne({ where: { patientId: patient.id } });
      if (!record) {
        record = await MedicalRecord.create({ patientId: patient.id });
      }
      // Crear solicitud de laboratorio
      const labReq = await LabRequest.create({
        medicalRecordId: record.id,
        type: obr.type || 'Desconocido',
        status: 'COMPLETADO',
      });
      // Guardar resultado como JSON en LabResult
      await LabResult.create({
        labRequestId: labReq.id,
        result: JSON.stringify(obx),
      });
      res.json({ message: 'Importación HL7 exitosa', paciente: patient.id, labRequest: labReq.id });
    } else {
      // Si no es HL7, solo mostrar el contenido
      res.json({ content });
    }
  } catch (err) {
    next(err);
  }
};

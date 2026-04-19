const PDFDocument = require('pdfkit');
const { MedicalRecord, Patient, LabRequest, LabResult } = require('../models');

exports.exportMedicalRecordPdf = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        { model: Patient },
        { model: LabRequest, include: [LabResult] }
      ]
    });
    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });
    const p = record.Patient;
    const nombreCompleto = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();
    let fechaNacimiento = '';
    let edad = '';
    if (p.fecha_nacimiento) {
      let fechaNacObj;
      if (typeof p.fecha_nacimiento === 'string') {
        fechaNacimiento = p.fecha_nacimiento.split('T')[0];
        fechaNacObj = new Date(fechaNacimiento);
      } else if (p.fecha_nacimiento instanceof Date) {
        fechaNacimiento = p.fecha_nacimiento.toISOString().split('T')[0];
        fechaNacObj = p.fecha_nacimiento;
      } else {
        fechaNacimiento = String(p.fecha_nacimiento);
        fechaNacObj = new Date(fechaNacimiento);
      }
      // Calcular edad
      if (!isNaN(fechaNacObj)) {
        const hoy = new Date();
        let years = hoy.getFullYear() - fechaNacObj.getFullYear();
        const m = hoy.getMonth() - fechaNacObj.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNacObj.getDate())) {
          years--;
        }
        edad = years;
      }
    }
    // Crear PDF con diseño personalizado
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Disposition', `attachment; filename=expediente_${nombreCompleto.replace(/ /g, '_')}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);


    // Encabezado con logo real y títulos

    const path = require('path');
    try {
      // Centra el logo y mantiene proporción (solo width)
      const logoPath = path.join(__dirname, '../../public/logo.png');
      doc.image(logoPath, 245, 40, { width: 120 });
    } catch (e) {
      doc.rect(250, 40, 110, 110).stroke(); // Si falla, deja marco
    }


    // Título principal en recuadro verde claro, debajo del logo
    const tituloY = 160;
    doc.rect(40, tituloY, 520, 50).fillAndStroke('#d0f0e0', '#000');
    doc.fillColor('#000').fontSize(12).font('Helvetica-Bold').text('Expediente clínico digital Hospital UP', 0, tituloY + 10, { align: 'center' });
    doc.font('Helvetica').fontSize(10).text('Dirección de Prestaciones Médicas', 0, tituloY + 25, { align: 'center' });
    doc.text('Unidad de Atención Médica', 0, tituloY + 38, { align: 'center' });

    let y = tituloY + 60;
    // Sección 1: Información del paciente
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(11).rect(40, y, 520, 22).fillAndStroke('#b7e6d9', '#000');
    doc.fillColor('#000').text('Sección 1. Información del paciente', 45, y + 5);
    y += 28;

    // Tabla de información del paciente
    const pacienteData = [
      ['Nombre(s):', p.nombres || '', 'NSS', p.nss || ''],
      ['Apellido Paterno', p.primer_apellido || '', 'Apellido Materno', p.segundo_apellido || ''],
      ['Curp', p.curp || '', 'Fecha de Nacimiento', fechaNacimiento],
      ['Sexo', p.sexo || '', 'Edad', edad || ''],
      ['Nacionalidad', p.nacionalidad || '', 'Estado de Nacimiento', p.estado_nacimiento || ''],
      ['Estado en el que reside', p.estado_residencia || '', 'Municipio en el que reside', p.municipio_residencia || ''],
      ['Localidad/barrio de residencia', p.localidad || '', 'Estado civil', p.estado_civil || ''],
      ['Domicilio', p.domicilio || '', 'Telefono', p.telefono || ''],
    ];
    // Dibujar tabla
    // Hacer cuadrada la tabla de paciente
    const cellW = 130, cellH = 24;
    for (let i = 0; i < pacienteData.length; i++) {
      let rowY = y + i * cellH;
      for (let j = 0, x = 40; j < 4; j++) {
        doc.rect(x, rowY, cellW, cellH).stroke();
        doc.font('Helvetica').fontSize(9).fillColor('#000').text(pacienteData[i][j], x + 4, rowY + 7, { width: cellW - 8, ellipsis: true });
        x += cellW;
      }
    }
    y += pacienteData.length * cellH + 10;

    // Sección 2: Historial médico
    doc.font('Helvetica-Bold').fontSize(11).rect(40, y, 520, 22).fillAndStroke('#b7e6d9', '#000');
    doc.fillColor('#000').text('Sección 2. Historial médico', 45, y + 5);
    y += 28;

    // Consultas previas (solo la actual)
    doc.font('Helvetica-Bold').fontSize(10).rect(50, y, 520, 24).stroke();
    doc.text('Consultas previas', 55, y + 7);
    y += 24;
    // Tabla de consulta cuadrada
    const consultaCellW = 130, consultaCellH = 24;
    // Fecha de consulta: fecha actual
    const fechaConsulta = new Date();
    const fechaConsultaStr = fechaConsulta.toISOString().split('T')[0];
    const consultaData = [
      ['Fecha de la consulta', fechaConsultaStr, 'Motivo:', record.motivo_consulta || ''],
      ['Diagnóstico:', record.diagnostico || '', 'Tratamiento:', record.tratamiento || ''],
      ['Nota clínica (si es que tiene)', record.notas_clinicas || '', '', ''],
    ];
    for (let i = 0; i < consultaData.length; i++) {
      let rowY = y + i * consultaCellH;
      for (let j = 0, x = 50; j < 4; j++) {
        doc.rect(x, rowY, consultaCellW, consultaCellH).stroke();
        doc.font('Helvetica').fontSize(9).fillColor('#000').text(consultaData[i][j], x + 4, rowY + 7, { width: consultaCellW - 8, ellipsis: true });
        x += consultaCellW;
      }
    }
    y += consultaData.length * consultaCellH + 10;

    // Resultados de laboratorio
    doc.font('Helvetica-Bold').fontSize(10).rect(60, y, 520, 24).stroke();
    doc.text('Resultados de laboratorio', 65, y + 7);
    y += 24;
    // Encabezado tabla cuadrada
    const labCellW = 173, labCellH = 22;
    doc.font('Helvetica-Bold').fontSize(9);
    const labHeaders = ['Tipo de estudio:', 'Fecha del estudio:', 'Resultado:'];
    for (let j = 0, x = 60; j < 3; j++) {
      doc.rect(x, y, labCellW, labCellH).stroke();
      doc.text(labHeaders[j], x + 4, y + 6, { width: labCellW - 8, ellipsis: true });
      x += labCellW;
    }
    y += labCellH;
    doc.font('Helvetica').fontSize(9);
    if (record.LabRequests && record.LabRequests.length > 0) {
      for (const lab of record.LabRequests) {
        let x = 60;
        doc.rect(x, y, labCellW, labCellH).stroke();
        doc.text(lab.type || '', x + 4, y + 6, { width: labCellW - 8, ellipsis: true });
        x += labCellW;
        doc.rect(x, y, labCellW, labCellH).stroke();
        doc.text(lab.createdAt ? lab.createdAt.toISOString().split('T')[0] : '', x + 4, y + 6, { width: labCellW - 8, ellipsis: true });
        x += labCellW;
        doc.rect(x, y, labCellW, labCellH).stroke();
        doc.text(lab.LabResult ? lab.LabResult.result || '' : 'Pendiente', x + 4, y + 6, { width: labCellW - 8, ellipsis: true });
        y += labCellH;
      }
    } else {
      doc.rect(60, y, labCellW * 3, labCellH).stroke();
      doc.text('Sin resultados de laboratorio', 63, y + 6);
      y += labCellH;
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};

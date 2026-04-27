const PDFDocument = require('pdfkit');
const { MedicalRecord, Patient, LabRequest, LabResult } = require('../models');
const path = require('path');

exports.exportMedicalRecordPdf = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [{ model: Patient }, { model: LabRequest, include: [LabResult] }]
    });

    if (!record) return res.status(404).json({ message: 'Expediente no encontrado' });

    const p = record.Patient;

    const nombreCompleto = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
    };

    const calcularEdad = (fecha) => {
      if (!fecha) return '';
      const f = new Date(fecha);
      const hoy = new Date();
      let edad = hoy.getFullYear() - f.getFullYear();
      const m = hoy.getMonth() - f.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;
      return edad;
    };

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expediente_${nombreCompleto.replace(/ /g, '_')}.pdf`
    );
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // =====================
    // 🎨 HEADER PRO
    // =====================
    try {
      doc.image(path.join(__dirname, '../../public/logo.png'), 40, 35, { width: 50 });
    } catch {}

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#0C447C')
      .text('Hospital UP Chiapas', 100, 40);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555')
      .text('Expediente Clínico Digital', 100, 60);

    // línea separadora
    doc
      .moveTo(40, 85)
      .lineTo(555, 85)
      .lineWidth(1)
      .strokeColor('#e5e7eb')
      .stroke();

    let y = 100;

    // =====================
    // 🧱 COMPONENTES UI
    // =====================

    const section = (title) => {
      doc
        .rect(40, y, 515, 22)
        .fill('#e6f0fa');

      doc
        .fillColor('#0C447C')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(title, 45, y + 6);

      y += 30;
    };

    const field = (label, value) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#111')
        .text(`${label}: `, 45, y, { continued: true });

      doc
        .font('Helvetica')
        .fillColor('#444')
        .text(value || '—');

      y += 15;
    };

    const card = (height = 10) => {
      doc
        .rect(40, y - 5, 515, height)
        .strokeColor('#e5e7eb')
        .stroke();
    };

    // =====================
    // 👤 PACIENTE
    // =====================
    section('1. Información del paciente');

    const startY = y;

    field('Nombre', nombreCompleto);
    field('NSS', p.nss);
    field('CURP', p.curp);
    field('Sexo', p.sexo);
    field('Fecha nacimiento', formatDate(p.fecha_nacimiento));
    field('Edad', calcularEdad(p.fecha_nacimiento));
    field('Nacionalidad', p.nacionalidad);
    field('Estado nacimiento', p.estado_nacimiento);
    field('Estado residencia', p.estado_residencia);
    field('Municipio', p.municipio_residencia);
    field('Localidad', p.localidad_residencia);
    field('Estado civil', p.estado_civil);
    field('Domicilio', p.domicilio);
    field('Teléfono', p.telefono);

    card(y - startY + 10);

    y += 10;

    // =====================
    // 🩺 CONSULTA
    // =====================
    section('2. Consulta médica');

    const startY2 = y;

    field('Fecha', formatDate(new Date()));
    field('Motivo', record.motivo_consulta);
    field('Diagnóstico', record.diagnostico);
    field('Tratamiento', record.tratamiento);

    y += 5;

    doc.font('Helvetica-Bold').text('Notas clínicas:', 45, y);
    y += 14;

    doc
      .font('Helvetica')
      .fillColor('#333')
      .text(record.notas_clinicas || 'Sin notas', {
        width: 500,
        align: 'left'
      });

    y = doc.y + 10;

    card(y - startY2 + 10);

    y += 10;

    // =====================
    // 🧪 LABS (TABLA PRO)
    // =====================
    section('3. Resultados de laboratorio');

    const colX = [40, 220, 350];
    const colW = [180, 130, 205];

    const header = ['Tipo', 'Fecha', 'Resultado'];

    // header tabla
    header.forEach((h, i) => {
      doc
        .rect(colX[i], y, colW[i], 20)
        .fill('#0C447C');

      doc
        .fillColor('#fff')
        .fontSize(9)
        .text(h, colX[i] + 5, y + 6);
    });

    y += 20;

    doc.fillColor('#000');

    if (record.LabRequests?.length > 0) {
      record.LabRequests.forEach((lab) => {
        const row = [
          lab.type || '',
          formatDate(lab.createdAt),
          lab.LabResult?.result || 'Pendiente'
        ];

        row.forEach((cell, i) => {
          doc
            .rect(colX[i], y, colW[i], 20)
            .stroke('#e5e7eb');

          doc
            .fontSize(9)
            .text(cell, colX[i] + 5, y + 6, {
              width: colW[i] - 10
            });
        });

        y += 20;
      });
    } else {
      doc
        .rect(40, y, 515, 20)
        .stroke('#e5e7eb');

      doc.text('Sin resultados registrados', 45, y + 6);
    }

    doc.end();

  } catch (err) {
    next(err);
  }
};
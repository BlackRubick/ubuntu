const PDFDocument = require('pdfkit');
const { MedicalRecord, Patient, LabRequest, LabResult } = require('../models');
const path = require('path');

// ─── Parsea el campo result (puede ser JSON array o string plano) ───
const parseResult = (raw) => {
  if (!raw) return 'Pendiente';

  // Intenta parsear como JSON
  try {
    const parsed = JSON.parse(raw);

    // Array de objetos con { name, value, units?, ref?, ... }
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          const name  = item.name  || item.code || '';
          const value = item.value !== undefined ? item.value : '';
          const units = item.units ? ` ${item.units}` : '';
          const ref   = item.ref   ? ` (ref: ${item.ref})`  : '';
          return `${name}: ${value}${units}${ref}`;
        })
        .filter(Boolean)
        .join('\n');
    }

    // Objeto simple { result: '...' }
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed.result || parsed.value || JSON.stringify(parsed);
    }

    return String(parsed);
  } catch {
    // No es JSON — devuelve el string original limpio
    return String(raw).trim();
  }
};

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
    // 🎨 HEADER
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
      doc.rect(40, y, 515, 22).fill('#e6f0fa');
      doc.fillColor('#0C447C').font('Helvetica-Bold').fontSize(11).text(title, 45, y + 6);
      y += 30;
    };

    const field = (label, value) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111').text(`${label}: `, 45, y, { continued: true });
      doc.font('Helvetica').fillColor('#444').text(value || '—');
      y += 15;
    };

    const card = (height = 10) => {
      doc.rect(40, y - 5, 515, height).strokeColor('#e5e7eb').stroke();
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

    doc.font('Helvetica').fillColor('#333').text(record.notas_clinicas || 'Sin notas', { width: 500, align: 'left' });

    y = doc.y + 10;

    card(y - startY2 + 10);
    y += 10;

    // =====================
    // 🧪 LABS — tabla con filas de altura dinámica
    // =====================
    section('3. Resultados de laboratorio');

    const colX = [40, 220, 350];
    const colW = [175, 125, 205];
    const ROW_PAD = 6; // padding vertical dentro de cada celda

    // ── Cabecera de tabla ──
    ['Tipo', 'Fecha', 'Resultado'].forEach((h, i) => {
      doc.rect(colX[i], y, colW[i], 20).fill('#0C447C');
      doc.fillColor('#fff').font('Helvetica-Bold').fontSize(9).text(h, colX[i] + 5, y + 6, { width: colW[i] - 10 });
    });
    y += 20;

    doc.fillColor('#000');

    if (record.LabRequests?.length > 0) {
      record.LabRequests.forEach((lab, rowIdx) => {
        const tipo      = lab.type || '';
        const fecha     = formatDate(lab.createdAt);
        // ── FIX PRINCIPAL: parsear el result ──
        const resultado = parseResult(lab.LabResult?.result);

        const cells = [tipo, fecha, resultado];

        // Calcular altura de fila según el texto más alto (col Resultado suele ser la más larga)
        const rowHeight = cells.reduce((maxH, text, i) => {
          const h = doc.heightOfString(text, { width: colW[i] - 10, fontSize: 9 });
          return Math.max(maxH, h + ROW_PAD * 2);
        }, 20);

        // Fondo alternado
        const rowBg = rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc';

        // Dibujar celdas
        cells.forEach((text, i) => {
          // Fondo + borde
          doc.rect(colX[i], y, colW[i], rowHeight).fill(rowBg).stroke('#e5e7eb');

          // Texto con wrap correcto
          doc
            .font(i === 0 ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .fillColor('#1a1a18')
            .text(text, colX[i] + 5, y + ROW_PAD, {
              width: colW[i] - 10,
              lineBreak: true,
            });
        });

        y += rowHeight;
      });
    } else {
      doc.rect(40, y, 515, 20).stroke('#e5e7eb');
      doc.font('Helvetica').fontSize(9).fillColor('#888').text('Sin resultados registrados', 45, y + 6);
      y += 20;
    }

    doc.end();

  } catch (err) {
    next(err);
  }
};
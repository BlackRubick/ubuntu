import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';

/* ─────────────────────────────────────────────
   ESTILOS INLINE — mismo sistema que ImportExportPage
───────────────────────────────────────────── */
const S = {
  page: {
    padding: '2rem 1.5rem',
    minHeight: '100vh',
    background: '#f8f7f5',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '1.75rem',
  },
  title: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#1a1a18',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#888780',
    marginTop: '4px',
  },
  btnNew: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    height: '36px',
    padding: '0 16px',
    borderRadius: '9px',
    border: 'none',
    background: '#0C447C',
    color: '#E6F1FB',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background .15s',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  /* tabla */
  tableWrap: {
    background: '#fff',
    border: '0.5px solid #e2e0d8',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  thead: {
    borderBottom: '0.5px solid #e2e0d8',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 500,
    color: '#888780',
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    whiteSpace: 'nowrap',
  },
  tr: (i) => ({
    borderBottom: '0.5px solid #f1efe8',
    background: i % 2 === 0 ? '#fff' : 'transparent',
    transition: 'background .1s',
  }),
  td: {
    padding: '11px 16px',
    color: '#1a1a18',
    verticalAlign: 'middle',
  },
  tdMuted: {
    padding: '11px 16px',
    color: '#888780',
    fontFamily: 'monospace',
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  pillType: {
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: '99px',
    fontSize: '11px',
    background: '#f1efe8',
    color: '#5f5e5a',
    border: '0.5px solid #d3d1c7',
  },
  downloadLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#185FA5',
    fontWeight: 500,
    textDecoration: 'none',
    padding: '3px 8px',
    borderRadius: '6px',
    background: '#E6F1FB',
    border: '0.5px solid #85B7EB',
    transition: 'background .12s',
  },
  emptyState: {
    padding: '3rem 1rem',
    textAlign: 'center',
    color: '#888780',
    fontSize: '13px',
  },
  errorMsg: {
    marginBottom: '1rem',
    fontSize: '12px',
    color: '#A32D2D',
    background: '#FCEBEB',
    border: '0.5px solid #F09595',
    borderRadius: '9px',
    padding: '10px 14px',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#888780',
    marginBottom: '1rem',
  },
  /* modal */
  modalInner: {
    width: '100%',
    maxWidth: '520px',
    background: '#fff',
    borderRadius: '14px',
    border: '0.5px solid #e2e0d8',
    overflow: 'hidden',
  },
  modalHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '0.5px solid #e2e0d8',
  },
  modalTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1a1a18',
    margin: 0,
  },
  modalDesc: {
    fontSize: '12px',
    color: '#888780',
    marginTop: '2px',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#888780',
    padding: '2px',
    lineHeight: 1,
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalFoot: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 20px',
    borderTop: '0.5px solid #e2e0d8',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: '#888780',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginBottom: '6px',
  },
  fieldInput: {
    width: '100%',
    height: '38px',
    padding: '0 10px',
    border: '0.5px solid #d3d1c7',
    borderRadius: '8px',
    background: '#f8f7f5',
    fontSize: '13px',
    color: '#1a1a18',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  dropZone: (active) => ({
    border: `1.5px dashed ${active ? '#378ADD' : '#d3d1c7'}`,
    borderRadius: '10px',
    padding: '20px 14px',
    textAlign: 'center',
    background: active ? '#E6F1FB22' : '#f8f7f5',
    cursor: 'pointer',
    transition: 'all .15s',
    position: 'relative',
  }),
  dropText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#444441',
    marginTop: '6px',
  },
  dropSub: {
    fontSize: '11px',
    color: '#888780',
    marginTop: '2px',
  },
  btnCancel: {
    height: '34px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '0.5px solid #d3d1c7',
    background: '#fff',
    color: '#5f5e5a',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSubmit: (disabled) => ({
    height: '34px',
    padding: '0 16px',
    borderRadius: '8px',
    border: 'none',
    background: disabled ? '#B5D4F4' : '#0C447C',
    color: '#E6F1FB',
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    transition: 'background .15s',
  }),
};

/* ─── Iconos ─── */
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M7 2v10M2 7h10"/>
  </svg>
);
const IconDownloadSm = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M5.5 1v6M3 5l2.5 2.5L8 5"/><path d="M1 9h9"/>
  </svg>
);
const IconCloud = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round">
    <path d="M12 5v10M9 11l3 4 3-4"/><rect x="3" y="18" width="18" height="3" rx="1.5"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8"/>
  </svg>
);

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const ResultsPanel = () => {
  const { data, loading, error, request } = useApi('/results', 'get');
  const postResultApi = useApi('/results', 'post');
  const labRequestsApi = useApi('/lab', 'get');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ labRequestId: '', result: '', file: null });
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const fetchResults = async () => { await request(); };

  useEffect(() => {
    fetchResults();
    labRequestsApi.request();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setForm(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let payload;
      let options = {};
      if (form.file) {
        payload = new FormData();
        payload.append('labRequestId', form.labRequestId);
        payload.append('result', form.result);
        payload.append('file', form.file);
        options = { headers: { 'Content-Type': 'multipart/form-data' } };
      } else {
        payload = { labRequestId: form.labRequestId, result: form.result };
      }
      if (form.file) {
        await postResultApi.request(payload, undefined, options);
      } else {
        await postResultApi.request(payload);
      }
      showToast('Resultado subido', 'success');
      setShowForm(false);
      setForm({ labRequestId: '', result: '', file: null });
      fetchResults();
    } catch (err) {
      console.error('Error al subir resultado:', err, err?.response?.data);
      showToast(`Error al subir resultado: ${err?.response?.data?.message || err.message || 'Error desconocido'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const rows = (data || []).map((r) => {
    let patientName = '—';
    if (r.LabRequest?.MedicalRecord?.Patient) {
      const p = r.LabRequest.MedicalRecord.Patient;
      patientName = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();
    }
    return { ...r, patientName };
  });

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Panel de resultados</h1>
          <p style={S.subtitle}>Resultados de estudios clínicos de laboratorio</p>
        </div>
        <RoleGuard roles={['LABORATORIO']}>
          <button
            style={S.btnNew}
            onClick={() => setShowForm(true)}
            onMouseEnter={e => e.currentTarget.style.background = '#185FA5'}
            onMouseLeave={e => e.currentTarget.style.background = '#0C447C'}
          >
            <IconPlus />
            Subir resultado
          </button>
        </RoleGuard>
      </div>

      {/* Estados */}
      {loading && (
        <div style={S.loadingRow}>
          <LoadingSpinner /> Cargando resultados...
        </div>
      )}
      {error && <div style={S.errorMsg}>{error}</div>}

      {/* Tabla */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead style={S.thead}>
            <tr>
              {['ID', 'Paciente', 'Solicitud', 'Resultado', 'Archivo'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} style={S.emptyState}>
                  No hay resultados registrados
                </td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={r.id} style={S.tr(i)}>
                <td style={S.tdMuted}>#{r.id}</td>
                <td style={S.td}>{r.patientName}</td>
                <td style={S.td}>
                  <span style={S.pillType}>
                    {r.LabRequest?.type || `#${r.labRequestId}`}
                  </span>
                </td>
                <td style={{ ...S.td, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.result || '—'}
                </td>
                <td style={S.td}>
                  {r.file ? (
                    <a
                      href={`http://localhost:4000${r.file}`}
                      style={S.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconDownloadSm /> Descargar
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div style={S.modalInner}>

          {/* Cabecera modal */}
          <div style={S.modalHead}>
            <div>
              <p style={S.modalTitle}>Subir resultado de laboratorio</p>
              <p style={S.modalDesc}>Adjunta el resultado e indica la solicitud correspondiente</p>
            </div>
            <button style={S.modalClose} onClick={() => setShowForm(false)}>
              <IconX />
            </button>
          </div>

          {/* Cuerpo modal */}
          <form onSubmit={handleSubmit}>
            <div style={S.modalBody}>

              {/* Solicitud */}
              <div>
                <label style={S.fieldLabel}>Solicitud <span style={{ color: '#E24B4A' }}>*</span></label>
                <select
                  name="labRequestId"
                  value={form.labRequestId}
                  onChange={handleChange}
                  required
                  disabled={labRequestsApi.loading}
                  style={{ ...S.fieldInput, height: '38px', cursor: 'pointer' }}
                >
                  <option value="">Selecciona una solicitud...</option>
                  {Array.isArray(labRequestsApi.data) && labRequestsApi.data.map((req) => {
                    const pat = req.MedicalRecord?.Patient;
                    const nombre = pat
                      ? `${pat.nombres || ''} ${pat.primer_apellido || ''} ${pat.segundo_apellido || ''}`.trim()
                      : `ID ${req.id}`;
                    return (
                      <option key={req.id} value={req.id}>
                        {nombre} — {req.type}
                      </option>
                    );
                  })}
                </select>
                {labRequestsApi.loading && <p style={{ fontSize: '11px', color: '#888780', marginTop: '4px' }}>Cargando solicitudes...</p>}
                {labRequestsApi.error && <p style={{ fontSize: '11px', color: '#A32D2D', marginTop: '4px' }}>Error al cargar solicitudes</p>}
              </div>

              {/* Resultado */}
              <div>
                <label style={S.fieldLabel}>Resultado <span style={{ color: '#E24B4A' }}>*</span></label>
                <input
                  type="text"
                  name="result"
                  value={form.result}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Hemoglobina 14.2 g/dL, leucocitos normales..."
                  style={S.fieldInput}
                />
              </div>

              {/* Archivo — drop zone */}
              <div>
                <label style={S.fieldLabel}>Archivo <span style={{ color: '#888780', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                <div
                  style={S.dropZone(dragOver)}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('result-file-input').click()}
                >
                  <input
                    id="result-file-input"
                    type="file"
                    name="file"
                    style={{ display: 'none' }}
                    onChange={handleChange}
                  />
                  <IconCloud color={dragOver ? '#185FA5' : '#b4b2a9'} />
                  <p style={S.dropText}>
                    {form.file ? form.file.name : 'Arrastra el archivo aquí'}
                  </p>
                  <p style={S.dropSub}>
                    {form.file
                      ? `${(form.file.size / 1024).toFixed(1)} KB`
                      : 'o haz clic para seleccionar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div style={S.modalFoot}>
              <button type="button" style={S.btnCancel} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" style={S.btnSubmit(submitting)} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar resultado'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default ResultsPanel;
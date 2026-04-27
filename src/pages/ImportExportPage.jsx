import React, { useState, useRef } from 'react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import useExportData from '../hooks/useExportData';

/* ─── inline styles como objeto para no depender de Tailwind extra ─── */
const S = {
  page: {
    padding: '2rem 1.5rem',
    minHeight: '100vh',
    background: '#f8f7f5',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    marginBottom: '2rem',
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
  /* ── nav tabs ── */
  navWrap: {
    display: 'flex',
    gap: '6px',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
  },
  navBtn: (active, accent) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 15px',
    borderRadius: '10px',
    border: active ? `1px solid ${accent.border}` : '1px solid #e2e0d8',
    background: active ? accent.bg : '#fff',
    color: active ? accent.text : '#888780',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all .15s',
    whiteSpace: 'nowrap',
  }),
  /* ── panel ── */
  panel: {
    background: '#fff',
    border: '0.5px solid #e2e0d8',
    borderRadius: '14px',
    overflow: 'hidden',
    maxWidth: '540px',
  },
  panelHead: (accent) => ({
    padding: '16px 20px',
    borderBottom: '0.5px solid #e2e0d8',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: accent.headBg,
  }),
  panelIcon: (accent) => ({
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    background: accent.iconBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  panelTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1a1a18',
    margin: 0,
  },
  panelDesc: {
    fontSize: '12px',
    color: '#888780',
    marginTop: '2px',
  },
  panelBody: {
    padding: '20px',
  },
  /* ── form ── */
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: '#888780',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    height: '38px',
    padding: '0 10px',
    border: '0.5px solid #d3d1c7',
    borderRadius: '8px',
    background: '#f8f7f5',
    fontSize: '13px',
    color: '#1a1a18',
    outline: 'none',
    cursor: 'pointer',
    marginBottom: '14px',
    fontFamily: 'inherit',
  },
  /* ── drop zone ── */
  dropZone: (active) => ({
    border: `1.5px dashed ${active ? '#378ADD' : '#d3d1c7'}`,
    borderRadius: '10px',
    padding: '28px 16px',
    textAlign: 'center',
    background: active ? '#E6F1FB22' : '#f8f7f5',
    cursor: 'pointer',
    transition: 'all .15s',
    position: 'relative',
    marginBottom: '14px',
  }),
  dropText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#444441',
    marginTop: '8px',
  },
  dropSub: {
    fontSize: '11px',
    color: '#888780',
    marginTop: '3px',
  },
  fileName: {
    fontSize: '12px',
    color: '#185FA5',
    fontWeight: 500,
    marginTop: '8px',
  },
  /* ── buttons ── */
  btnPrimary: (accent, disabled) => ({
    width: '100%',
    height: '38px',
    border: 'none',
    borderRadius: '9px',
    background: disabled ? accent.disabledBg : accent.btnBg,
    color: disabled ? accent.disabledText : accent.btnText,
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    transition: 'all .15s',
    fontFamily: 'inherit',
  }),
  /* ── imported content ── */
  importedBox: {
    marginTop: '14px',
    background: '#f8f7f5',
    border: '0.5px solid #e2e0d8',
    borderRadius: '9px',
    padding: '12px 14px',
  },
  importedLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#888780',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginBottom: '8px',
  },
  importedContent: {
    fontSize: '12px',
    color: '#1a1a18',
    fontFamily: 'monospace',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
    maxHeight: '140px',
    overflowY: 'auto',
  },
  errorMsg: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#A32D2D',
    background: '#FCEBEB',
    border: '0.5px solid #F09595',
    borderRadius: '7px',
    padding: '8px 10px',
  },
};

/* ── colores por sección ── */
const ACCENTS = {
  exp: {
    border: '#85B7EB', bg: '#E6F1FB', text: '#0C447C',
    headBg: '#fafafa', iconBg: '#E6F1FB',
    btnBg: '#0C447C', btnText: '#E6F1FB',
    disabledBg: '#B5D4F4', disabledText: '#E6F1FB',
    iconColor: '#0C447C',
  },
  lab: {
    border: '#85B7EB', bg: '#E6F1FB', text: '#0C447C',
    headBg: '#fafafa', iconBg: '#E6F1FB',
    btnBg: '#0C447C', btnText: '#E6F1FB',
    disabledBg: '#B5D4F4', disabledText: '#E6F1FB',
    iconColor: '#0C447C',
  },
  pdf: {
    border: '#97C459', bg: '#EAF3DE', text: '#27500A',
    headBg: '#fafafa', iconBg: '#EAF3DE',
    btnBg: '#27500A', btnText: '#EAF3DE',
    disabledBg: '#C0DD97', disabledText: '#EAF3DE',
    iconColor: '#27500A',
  },
  import: {
    border: '#AFA9EC', bg: '#EEEDFE', text: '#3C3489',
    headBg: '#fafafa', iconBg: '#EEEDFE',
    btnBg: '#3C3489', btnText: '#EEEDFE',
    disabledBg: '#CECBF6', disabledText: '#EEEDFE',
    iconColor: '#3C3489',
  },
};

/* ── iconos SVG inline ── */
const IconDoc = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
    <rect x="3.5" y="1.5" width="11" height="15" rx="2"/>
    <path d="M6.5 6h5M6.5 9h5M6.5 12h3"/>
  </svg>
);
const IconFlask = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
    <path d="M7 2v6L3.5 14.5a1 1 0 00.9 1.5h9.2a1 1 0 00.9-1.5L11 8V2"/>
    <path d="M6.5 2h5"/>
  </svg>
);
const IconPdf = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
    <path d="M10 1.5H5a1.5 1.5 0 00-1.5 1.5v12A1.5 1.5 0 005 16.5h8a1.5 1.5 0 001.5-1.5V7L10 1.5z"/>
    <path d="M10 1.5V7h4.5"/>
    <path d="M6 11h6M6 13.5h4"/>
  </svg>
);
const IconImport = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
    <path d="M9 3v9M6 9l3 3 3-3"/>
    <path d="M3 14h12"/>
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M7 1v8M4 6l3 3 3-3"/><path d="M2 11h10"/>
  </svg>
);
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M7 9V1M4 4l3-3 3 3"/><path d="M2 11h10"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 7l4 4 6-7"/>
  </svg>
);
const IconCloud = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round">
    <path d="M14 7v12M10 14l4 5 4-5"/>
    <rect x="5" y="20" width="18" height="4" rx="2"/>
  </svg>
);

/* ══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
const ImportExportPage = () => {
  const [activeTab, setActiveTab] = useState('exp');
  const [selectedRecord, setSelectedRecord] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedPatientPdf, setSelectedPatientPdf] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importContent, setImportContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [btnState, setBtnState] = useState('idle'); // idle | loading | done
  const fileRef = useRef();
  const { toast, showToast, closeToast } = useToast();
  const { patients, medicalRecords, labResults, loading: loadingData, error } = useExportData();

  /* ── helpers de descarga ── */
  const triggerDownload = (blobData, filename) => {
    const blobUrl = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const withLoadingState = async (fn) => {
    setLoading(true);
    setBtnState('loading');
    try {
      await fn();
      setBtnState('done');
      setTimeout(() => setBtnState('idle'), 2000);
    } catch (err) {
      setBtnState('idle');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ── handlers ── */
  const handleExportExp = async (e) => {
    e.preventDefault();
    await withLoadingState(async () => {
      const rec = medicalRecords.find(r => r.id === Number(selectedRecord));
      const p = rec?.Patient
        ? `${rec.Patient.nombres || ''}_${rec.Patient.primer_apellido || ''}_${rec.Patient.segundo_apellido || ''}`.replace(/ /g, '_')
        : selectedRecord;
      const res = await api.get(`/files/export/${selectedRecord}`, { responseType: 'blob' });
      triggerDownload(res.data, `expediente_${p}.txt`);
      showToast('Expediente exportado', 'success');
    }).catch(() => showToast('Error al exportar', 'error'));
  };

  const handleExportLab = async (e) => {
    e.preventDefault();
    await withLoadingState(async () => {
      const lab = labResults.find(l => l.id === Number(selectedLab));
      const pat = lab?.LabRequest?.MedicalRecord?.Patient;
      const p = pat
        ? `${pat.nombres || ''}_${pat.primer_apellido || ''}_${pat.segundo_apellido || ''}`.replace(/ /g, '_')
        : selectedLab;
      const res = await api.get(`/files/export-lab/${selectedLab}`, { responseType: 'blob' });
      triggerDownload(res.data, `labresult_${p}.txt`);
      showToast('Resultado exportado', 'success');
    }).catch(() => showToast('Error al exportar', 'error'));
  };

  const handleExportPdf = async (e) => {
    e.preventDefault();
    await withLoadingState(async () => {
      const record = medicalRecords.find(r => r.Patient && r.Patient.id === Number(selectedPatientPdf));
      if (!record) throw new Error('Sin expediente');
      const p = record.Patient;
      const filename = `expediente_${p.nombres || ''}_${p.primer_apellido || ''}_${p.segundo_apellido || ''}.pdf`.replace(/ /g, '_');
      const res = await api.get(`/files/export-pdf/${record.id}`, { responseType: 'blob' });
      triggerDownload(res.data, filename);
      showToast('PDF exportado', 'success');
    }).catch(() => showToast('Error al exportar PDF', 'error'));
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    await withLoadingState(async () => {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await api.post('/files/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportContent(res.data.content);
      showToast('Archivo importado', 'success');
    }).catch((err) => {
      if (err.response?.status === 403) {
        showToast('Solo un usuario ADMIN puede importar expedientes.', 'error');
      } else {
        showToast('Error al importar', 'error');
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.txt')) setImportFile(file);
  };

  /* ── botón label según estado ── */
  const BtnLabel = ({ idle, accent }) => {
    if (btnState === 'loading') return <><span style={{ display: 'inline-block', animation: 'spin .8s linear infinite' }}>↻</span> Procesando...</>;
    if (btnState === 'done') return <><IconCheck /> Listo</>;
    return <>{idle}</>;
  };

  const tabs = [
    { id: 'exp',    label: 'Expediente',  Icon: IconDoc,    accent: ACCENTS.exp },
    { id: 'lab',    label: 'Laboratorio', Icon: IconFlask,  accent: ACCENTS.lab },
    { id: 'pdf',    label: 'PDF',         Icon: IconPdf,    accent: ACCENTS.pdf },
    { id: 'import', label: 'Importar',    Icon: IconImport, accent: ACCENTS.import },
  ];

  const a = ACCENTS[activeTab];
  const isDisabled = loading || loadingData || btnState === 'loading';

  return (
    <div style={{
      ...S.page,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)', // para dejar espacio al navbar
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>Gestión de archivos</h1>
        <p style={S.subtitle}>Exporta expedientes, resultados de laboratorio y descarga en PDF</p>
      </div>

      {/* Nav tabs */}
      <div style={S.navWrap}>
        {tabs.map(({ id, label, Icon, accent }) => (
          <button
            key={id}
            style={S.navBtn(activeTab === id, accent)}
            onClick={() => { setActiveTab(id); setBtnState('idle'); }}
          >
            <Icon color={activeTab === id ? accent.text : '#888780'} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Panel: Exportar expediente ── */}
      {activeTab === 'exp' && (
        <div style={S.panel}>
          <div style={S.panelHead(a)}>
            <div style={S.panelIcon(a)}><IconDoc color={a.iconColor} /></div>
            <div>
              <p style={S.panelTitle}>Exportar expediente médico</p>
              <p style={S.panelDesc}>Descarga el expediente en formato .txt</p>
            </div>
          </div>
          <div style={S.panelBody}>
            <form onSubmit={handleExportExp}>
              <label style={S.fieldLabel}>Expediente</label>
              <select
                value={selectedRecord}
                onChange={e => setSelectedRecord(e.target.value)}
                style={S.select}
                required
                disabled={loadingData}
              >
                <option value="">Selecciona un expediente...</option>
                {medicalRecords.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.Patient
                      ? `${r.Patient.nombres} ${r.Patient.primer_apellido} ${r.Patient.segundo_apellido}`
                      : r.id}
                    {r.motivo_consulta ? ` — ${r.motivo_consulta}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={S.btnPrimary(a, isDisabled || !selectedRecord)}
                disabled={isDisabled || !selectedRecord}
              >
                <BtnLabel idle={<><IconDownload /> Descargar .txt</>} accent={a} />
              </button>
              {error && <div style={S.errorMsg}>{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* ── Panel: Exportar laboratorio ── */}
      {activeTab === 'lab' && (
        <div style={S.panel}>
          <div style={S.panelHead(a)}>
            <div style={S.panelIcon(a)}><IconFlask color={a.iconColor} /></div>
            <div>
              <p style={S.panelTitle}>Exportar resultado de laboratorio</p>
              <p style={S.panelDesc}>Descarga el resultado en formato .txt</p>
            </div>
          </div>
          <div style={S.panelBody}>
            <form onSubmit={handleExportLab}>
              <label style={S.fieldLabel}>Resultado</label>
              <select
                value={selectedLab}
                onChange={e => setSelectedLab(e.target.value)}
                style={S.select}
                required
                disabled={loadingData}
              >
                <option value="">Selecciona un resultado...</option>
                {labResults.map(l => {
                  const pat = l.LabRequest?.MedicalRecord?.Patient;
                  const nombre = pat
                    ? `${pat.nombres} ${pat.primer_apellido} ${pat.segundo_apellido}`
                    : l.id;
                  return (
                    <option key={l.id} value={l.id}>
                      {nombre}{l.LabRequest?.type ? ` — ${l.LabRequest.type}` : ''}
                    </option>
                  );
                })}
              </select>
              <button
                type="submit"
                style={S.btnPrimary(a, isDisabled || !selectedLab)}
                disabled={isDisabled || !selectedLab}
              >
                <BtnLabel idle={<><IconDownload /> Descargar .txt</>} accent={a} />
              </button>
              {error && <div style={S.errorMsg}>{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* ── Panel: PDF ── */}
      {activeTab === 'pdf' && (
        <div style={S.panel}>
          <div style={S.panelHead(a)}>
            <div style={S.panelIcon(a)}><IconPdf color={a.iconColor} /></div>
            <div>
              <p style={S.panelTitle}>Descargar expediente en PDF</p>
              <p style={S.panelDesc}>Genera el PDF completo del expediente clínico</p>
            </div>
          </div>
          <div style={S.panelBody}>
            <form onSubmit={handleExportPdf}>
              <label style={S.fieldLabel}>Paciente</label>
              <select
                value={selectedPatientPdf}
                onChange={e => setSelectedPatientPdf(e.target.value)}
                style={S.select}
                required
                disabled={loadingData}
              >
                <option value="">Selecciona un paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.primer_apellido} {p.segundo_apellido}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={S.btnPrimary(a, isDisabled || !selectedPatientPdf)}
                disabled={isDisabled || !selectedPatientPdf}
              >
                <BtnLabel idle={<><IconDownload /> Descargar PDF</>} accent={a} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Panel: Importar ── */}
      {activeTab === 'import' && (
        <div style={S.panel}>
          <div style={S.panelHead(a)}>
            <div style={S.panelIcon(a)}><IconImport color={a.iconColor} /></div>
            <div>
              <p style={S.panelTitle}>Importar expediente desde .txt</p>
              <p style={S.panelDesc}>Solo usuarios ADMIN pueden importar</p>
            </div>
          </div>
          <div style={S.panelBody}>
            <form onSubmit={handleImport}>
              {/* Drop zone */}
              <div
                style={S.dropZone(dragOver)}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt"
                  style={{ display: 'none' }}
                  onChange={e => setImportFile(e.target.files[0])}
                  required
                />
                <IconCloud color={dragOver ? '#185FA5' : '#b4b2a9'} />
                <p style={S.dropText}>
                  {importFile ? importFile.name : 'Arrastra tu archivo .txt aquí'}
                </p>
                <p style={S.dropSub}>
                  {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'o haz clic para seleccionar'}
                </p>
              </div>

              <button
                type="submit"
                style={S.btnPrimary(a, isDisabled || !importFile)}
                disabled={isDisabled || !importFile}
              >
                <BtnLabel idle={<><IconUpload /> Importar expediente</>} accent={a} />
              </button>
            </form>

            {importContent && (
              <div style={S.importedBox}>
                <p style={S.importedLabel}>Contenido importado</p>
                <pre style={S.importedContent}>{importContent}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {loadingData && (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888780' }}>
          <LoadingSpinner /> Cargando datos...
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default ImportExportPage;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';
import useAuthStore from '../store/useAuthStore';

const STUDY_TYPES = [
  'Biometría hemática',
  'Glucosa',
  'Perfil lipídico',
  'Uroanálisis',
];

const STATUS_CONFIG = {
  PENDIENTE:   { label: 'Pendiente',   bg: '#FAEEDA', color: '#633806', dot: '#BA7517' },
  EN_PROCESO:  { label: 'En proceso',  bg: '#E6F1FB', color: '#0C447C', dot: '#185FA5' },
  COMPLETADO:  { label: 'Completado',  bg: '#EAF3DE', color: '#27500A', dot: '#3B6D11' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDIENTE;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const initialForm = {
  patientId: '',
  medicalRecordId: '',
  type: '',
  objetivo_tratamiento: '',
  riesgos_tratamiento: '',
  consentimiento_informado: '',
};

const LabPanel = () => {
  const { id: urlMedicalRecordId } = useParams();
  const { data, loading, error, request } = useApi('/lab', 'get');
  const patientsApi = useApi('/patients', 'get');
  const postLabApi = useApi('/lab', 'post');
  const putStatusApi = useApi('/lab', 'put');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...initialForm, medicalRecordId: urlMedicalRecordId || '' });
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);

  const fetchRequests = async () => { await request(); };

  useEffect(() => {
    fetchRequests();
    if (!urlMedicalRecordId) patientsApi.request();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (urlMedicalRecordId) setForm((prev) => ({ ...prev, medicalRecordId: urlMedicalRecordId }));
  }, [urlMedicalRecordId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (!consentChecked) return;
    const paciente = Array.isArray(patientsApi.data)
      ? patientsApi.data.find((p) => p.MedicalRecord && p.MedicalRecord.id == form.medicalRecordId)
      : null;
    const medico = user?.name || '';
    const fecha = new Date().toLocaleDateString('es-MX');
    const nombre_paciente = paciente
      ? `${paciente.nombres || ''} ${paciente.primer_apellido || ''} ${paciente.segundo_apellido || ''}`.trim()
      : '';
    const edad = paciente?.fecha_nacimiento
      ? Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))
      : '';
    const texto = `CARTA DE CONSENTIMIENTO INFORMADO Y AVISO DE PRIVACIDAD INTEGRAL
Institución: Hospital UP Chiapas  Fecha: ${fecha}  Número de Expediente: ${form.medicalRecordId}
I. Ficha de Identificación y Declaración
Yo, ${nombre_paciente}, de ${edad} años de edad, con domicilio en ${paciente?.domicilio || ''}, ${paciente?.municipio_residencia || ''}, ${paciente?.estado_residencia || ''} en pleno uso de mis facultades mentales, manifiesto que el/la Médico ${medico} me ha informado sobre la necesidad de realizar: ${form.type}.
II. Información del Acto Médico (NOM-004-SSA3-2012)
Objetivos: ${form.objetivo_tratamiento}.
Riesgos: ${form.riesgos_tratamiento}.
Alternativas: Se me han presentado opciones de tratamiento alternativas con sus alcances.
III. Aviso de Privacidad y Manejo de Base de Datos
En cumplimiento con la NOM-004-SSA3-2012, el Hospital informa que sus datos personales y sensibles serán integrados a nuestra base de datos para la integración y conservación del expediente clínico por un periodo mínimo de 5 años. Sus derechos ARCO pueden ser ejercidos ante la administración.`;
    setForm((prev) => ({ ...prev, consentimiento_informado: texto }));
  }, [consentChecked, form.medicalRecordId, form.type, form.objetivo_tratamiento, form.riesgos_tratamiento, patientsApi.data, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentChecked) { showToast('Debes aceptar el consentimiento informado', 'error'); return; }
    setSubmitting(true);
    try {
      let medicalRecordId = form.medicalRecordId;
      if (!medicalRecordId && form.patientId) {
        const paciente = Array.isArray(patientsApi.data) ? patientsApi.data.find((p) => p.id == form.patientId) : null;
        if (paciente?.MedicalRecords?.length > 0) {
          medicalRecordId = paciente.MedicalRecords[0].id;
        } else {
          const res = await fetch('/api/medical-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ patientId: form.patientId, motivo_consulta: '', diagnostico: '', tratamiento: '', notas_clinicas: '' }),
          });
          const d = await res.json();
          medicalRecordId = d.id;
        }
      }
      await postLabApi.request({ ...form, medicalRecordId });
      showToast('Solicitud creada', 'success');
      setShowForm(false);
      setForm({ ...initialForm, medicalRecordId: urlMedicalRecordId || '' });
      setConsentChecked(false);
      fetchRequests();
    } catch {
      showToast('Error al crear solicitud', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await putStatusApi.request({ status }, `/lab/${id}/status`);
      showToast('Estado actualizado', 'success');
      fetchRequests();
    } catch {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const records = data || [];
  const counts = {
    total: records.length,
    pendiente: records.filter((r) => r.status === 'PENDIENTE').length,
    proceso: records.filter((r) => r.status === 'EN_PROCESO').length,
    completado: records.filter((r) => r.status === 'COMPLETADO').length,
  };

  const isForbidden = user?.role === 'LABORATORIO' &&
    (error === 'Forbidden' || error === 'Request failed with status code 403');

  return (
    // ← quitado p-6 en móvil, solo padding horizontal pequeño; p-6 desde sm
    <div className="px-3 py-4 sm:p-6 min-h-screen bg-gray-50">

      {/* Header */}
      {/* ← en móvil apila verticalmente; en sm vuelve a fila */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Panel de laboratorio</h1>
          <p className="text-sm text-gray-400 mt-0.5">Seguimiento de solicitudes de estudios clínicos</p>
        </div>
        <RoleGuard roles={['ADMIN', 'MEDICO']}>
          {/* ← botón full-width en móvil, auto en sm */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#E6F1FB] transition active:scale-[0.98]"
            style={{ background: '#0C447C' }}
            onMouseEnter={e => e.currentTarget.style.background = '#185FA5'}
            onMouseLeave={e => e.currentTarget.style.background = '#0C447C'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M7 2v10M2 7h10" />
            </svg>
            Nueva solicitud
          </button>
        </RoleGuard>
      </div>

      {/* Stats — 2 cols en móvil, 4 en md (sin cambio, ya estaba bien) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total solicitudes', value: counts.total,      sub: 'en el sistema',  color: 'text-gray-900' },
          { label: 'Pendientes',        value: counts.pendiente,  sub: 'por procesar',   color: 'text-amber-700' },
          { label: 'En proceso',        value: counts.proceso,    sub: 'en análisis',    color: 'text-blue-700' },
          { label: 'Completados',       value: counts.completado, sub: 'listos',         color: 'text-green-700' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-[11px] text-gray-500 mb-1 leading-snug">{label}</div>
            <div className={`text-2xl font-medium ${color} leading-none`}>{value}</div>
            <div className="text-[11px] text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <LoadingSpinner /> Cargando solicitudes...
        </div>
      )}
      {!isForbidden && error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">{error}</div>
      )}

      {/* Table — en móvil scroll horizontal; en desktop normal */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">

        {/* ── VISTA DESKTOP (sm+): tabla completa ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'Paciente', 'Tipo de estudio', 'Expediente', 'Estado', 'Actualizar'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : records.map((r) => {
                const nombre = r.MedicalRecord?.Patient
                  ? `${r.MedicalRecord.Patient.nombres || ''} ${r.MedicalRecord.Patient.primer_apellido || ''} ${r.MedicalRecord.Patient.segundo_apellido || ''}`.trim()
                  : '—';
                return (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-400">#{r.id}</td>
                    <td className="px-4 py-3 text-gray-900">{nombre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600 border border-gray-200">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono"
                        style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="2" y="1" width="8" height="10" rx="1"/><path d="M4 4h4M4 6h4M4 8h2"/>
                        </svg>
                        EXP-{r.medicalRecordId || r.MedicalRecord?.id || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <RoleGuard roles={['ADMIN', 'LABORATORIO']}>
                        <select
                          value={r.status}
                          onChange={(e) => handleStatus(r.id, e.target.value)}
                          className="h-7 px-2 text-xs border border-gray-200 rounded-md bg-gray-50 text-gray-700 outline-none cursor-pointer"
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROCESO">En proceso</option>
                          <option value="COMPLETADO">Completado</option>
                        </select>
                      </RoleGuard>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── VISTA MÓVIL: cards apiladas ── */}
        <div className="sm:hidden divide-y divide-gray-50">
          {records.length === 0 && !loading ? (
            <p className="px-4 py-12 text-center text-sm text-gray-400">No hay solicitudes registradas</p>
          ) : records.map((r) => {
            const nombre = r.MedicalRecord?.Patient
              ? `${r.MedicalRecord.Patient.nombres || ''} ${r.MedicalRecord.Patient.primer_apellido || ''} ${r.MedicalRecord.Patient.segundo_apellido || ''}`.trim()
              : '—';
            return (
              <div key={r.id} className="px-4 py-3 flex flex-col gap-2">
                {/* Fila 1: ID + expediente */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-gray-400">#{r.id}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono"
                    style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="2" y="1" width="8" height="10" rx="1"/><path d="M4 4h4M4 6h4M4 8h2"/>
                    </svg>
                    EXP-{r.medicalRecordId || r.MedicalRecord?.id || '—'}
                  </span>
                </div>
                {/* Fila 2: nombre */}
                <div className="text-sm text-gray-900 font-medium">{nombre}</div>
                {/* Fila 3: tipo + estado */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600 border border-gray-200">
                    {r.type}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                {/* Fila 4: selector actualizar */}
                <RoleGuard roles={['ADMIN', 'LABORATORIO']}>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatus(r.id, e.target.value)}
                    className="h-8 px-2 text-xs border border-gray-200 rounded-md bg-gray-50 text-gray-700 outline-none cursor-pointer w-full"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="COMPLETADO">Completado</option>
                  </select>
                </RoleGuard>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        {/* ← w-full en móvil, max-w-xl en sm+ */}
        <div className="w-full sm:max-w-xl mx-auto bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Modal header */}
          <div className="flex items-start justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Nueva solicitud de laboratorio</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Completa los datos del estudio y el consentimiento</p>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ← col-span-2 fijo en móvil (grid de 1), grid-cols-2 desde sm */}
            <div className="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">

              {/* Paciente o ID expediente */}
              {!urlMedicalRecordId ? (
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Paciente <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="patientId"
                    value={form.patientId}
                    onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value, medicalRecordId: '' }))}
                    required
                    disabled={patientsApi.loading}
                    className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-400 transition"
                  >
                    <option value="">Selecciona un paciente...</option>
                    {Array.isArray(patientsApi.data) && patientsApi.data.map((p) => (
                      <option key={p.id} value={p.id}>
                        {`${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                  {patientsApi.loading && <p className="text-[11px] text-gray-400 mt-1">Cargando pacientes...</p>}
                  {patientsApi.error && <p className="text-[11px] text-red-500 mt-1">Error al cargar pacientes</p>}
                </div>
              ) : (
                <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">Expediente vinculado:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono"
                    style={{ background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' }}>
                    EXP-{urlMedicalRecordId}
                  </span>
                </div>
              )}

              {/* Tipo de estudio */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Tipo de estudio <span className="text-red-400">*</span>
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-400 transition"
                >
                  <option value="">Selecciona un tipo de estudio...</option>
                  {STUDY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Objetivo */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Objetivo del tratamiento <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="objetivo_tratamiento"
                  value={form.objetivo_tratamiento}
                  onChange={handleChange}
                  required
                  placeholder="Describe el objetivo del tratamiento..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-400 transition resize-none"
                />
              </div>

              {/* Riesgos */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Riesgos del tratamiento <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="riesgos_tratamiento"
                  value={form.riesgos_tratamiento}
                  onChange={handleChange}
                  required
                  placeholder="Describe los riesgos conocidos..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-400 transition resize-none"
                />
              </div>

              {/* Consentimiento */}
              <div className="col-span-1 sm:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    required
                    className="mt-0.5 accent-blue-700 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Certifico que el paciente ha leído el Aviso de Privacidad y otorga su consentimiento informado para el tratamiento médico.
                  </span>
                </label>
                {consentChecked && form.consentimiento_informado && (
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-500 font-mono leading-relaxed whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {form.consentimiento_informado}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-4 sm:px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-8 px-4 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-8 px-4 text-sm font-medium text-[#E6F1FB] rounded-lg disabled:opacity-50 transition"
                style={{ background: '#0C447C' }}
              >
                {submitting ? 'Guardando...' : 'Guardar solicitud'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default LabPanel;
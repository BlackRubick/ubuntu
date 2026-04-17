import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';
import useAuthStore from '../store/useAuthStore';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'patient', label: 'Paciente' },
  { key: 'type', label: 'Tipo de estudio' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: '' },
];

const LabPanel = () => {
  const { id: urlMedicalRecordId } = useParams();
  const { data, loading, error, request } = useApi('/lab', 'get');
  const patientsApi = useApi('/patients', 'get');
  const postLabApi = useApi('/lab', 'post');
  const putStatusApi = useApi('/lab', 'put');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medicalRecordId: urlMedicalRecordId || '',
    type: '',
    objetivo_tratamiento: '',
    riesgos_tratamiento: '',
    consentimiento_informado: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);

  const fetchRequests = async () => {
    await request();
  };

  useEffect(() => {
    fetchRequests();
    if (!urlMedicalRecordId) {
      patientsApi.request();
    }
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generar consentimiento informado al marcar la casilla
  useEffect(() => {
    if (!consentChecked) return;
    // Buscar datos del paciente y médico
    const paciente = Array.isArray(patientsApi.data)
      ? patientsApi.data.find((p) => p.MedicalRecord && p.MedicalRecord.id == form.medicalRecordId)
      : null;
    const medico = user?.name || '';
    const fecha = new Date().toLocaleDateString('es-MX');
    const nombre_paciente = paciente ? `${paciente.nombres || ''} ${paciente.primer_apellido || ''} ${paciente.segundo_apellido || ''}`.trim() : '';
    const edad = paciente && paciente.fecha_nacimiento ?
      Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : '';
    const direccion = paciente?.domicilio || '';
    const municipio = paciente?.municipio_residencia || '';
    const estado = paciente?.estado_residencia || '';
    const id_expediente = form.medicalRecordId;
    const nombre_procedimiento = form.type;
    const objetivo = form.objetivo_tratamiento;
    const riesgos = form.riesgos_tratamiento;
    const texto = `CARTA DE CONSENTIMIENTO INFORMADO Y AVISO DE PRIVACIDAD INTEGRAL\nInstitución: Hospital UP Chiapas Fecha: ${fecha} Número de Expediente: ${id_expediente}\nI. Ficha de Identificación y Declaración\nYo, ${nombre_paciente}, de ${edad} años de edad, con domicilio en ${direccion}, ${municipio},${estado} en pleno uso de mis facultades mentales, manifiesto que el/la Médico ${medico} me ha informado sobre la necesidad de realizar: ${nombre_procedimiento}.\nII. Información del Acto Médico (NOM-004-SSA3-2012)\nObjetivos: ${objetivo}.\nRiesgos: ${riesgos}.\nAlternativas: Se me han presentado opciones de tratamiento alternativas con sus alcances.\nIII. Aviso de Privacidad y Manejo de Base de Datos En cumplimiento con la NOM-004-SSA3-2012, el Hospital informa que sus datos personales y sensibles serán integrados a nuestra base de datos para la integración y conservación del expediente clínico por un periodo mínimo de 5 años. Sus derechos ARCO pueden ser ejercidos ante la administración.`;
    setForm((prev) => ({ ...prev, consentimiento_informado: texto }));
  }, [consentChecked, form.medicalRecordId, form.type, form.objetivo_tratamiento, form.riesgos_tratamiento, patientsApi.data, user]);

  // Si el id de expediente viene de la URL, actualiza el form cuando cambie
  useEffect(() => {
    if (urlMedicalRecordId) {
      setForm((prev) => ({ ...prev, medicalRecordId: urlMedicalRecordId }));
    }
  }, [urlMedicalRecordId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentChecked) {
      showToast('Debes aceptar el consentimiento informado', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await postLabApi.request(form);
      showToast('Solicitud creada', 'success');
      setShowForm(false);
      setForm({ medicalRecordId: '', type: '', objetivo_tratamiento: '', riesgos_tratamiento: '', consentimiento_informado: '' });
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Panel de Laboratorio</h2>
      <RoleGuard roles={['ADMIN', 'MEDICO']}>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4" onClick={() => setShowForm(true)}>Nueva solicitud</button>
      </RoleGuard>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva solicitud de laboratorio">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!urlMedicalRecordId && (
            <div>
              <label className="block text-gray-700 mb-1">Paciente</label>
              <select
                name="medicalRecordId"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition-all bg-white"
                value={form.medicalRecordId}
                onChange={handleChange}
                required
                disabled={patientsApi.loading}
              >
                <option value="">Selecciona un paciente...</option>
                {Array.isArray(patientsApi.data) && patientsApi.data
                  .filter((p) => p.MedicalRecord)
                  .map((p) => (
                    <option key={p.MedicalRecord.id} value={p.MedicalRecord.id}>
                      {`${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim()}
                    </option>
                  ))}
              </select>
              {patientsApi.loading && <div className="text-xs text-gray-500 mt-1">Cargando pacientes...</div>}
              {patientsApi.error && <div className="text-xs text-red-500 mt-1">Error al cargar pacientes</div>}
            </div>
          )}
          {urlMedicalRecordId && (
            <div className="col-span-2">
              <div className="text-gray-700 mb-1 font-semibold">ID Expediente: <span className="text-blue-700">{urlMedicalRecordId}</span></div>
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Tipo de estudio</label>
            <select name="type" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition-all bg-white" value={form.type} onChange={handleChange} required>
              <option value="">Selecciona...</option>
              <option value="Biometría hemática">Biometría hemática</option>
              <option value="Glucosa">Glucosa</option>
              <option value="Perfil lipídico">Perfil lipídico</option>
              <option value="Uroanálisis">Uroanálisis</option>
            </select>
          </div>
          <FormField label="Objetivo del tratamiento" name="objetivo_tratamiento" value={form.objetivo_tratamiento} onChange={handleChange} required />
          <FormField label="Riesgos del tratamiento" name="riesgos_tratamiento" value={form.riesgos_tratamiento} onChange={handleChange} required />
          <div className="col-span-2 flex items-center gap-2 mt-2">
            <input type="checkbox" id="consentimiento" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} required />
            <label htmlFor="consentimiento" className="text-gray-700 select-none">
              Certifico que el paciente ha leído el Aviso de Privacidad y otorga su consentimiento informado para el tratamiento médico.
            </label>
          </div>
          {consentChecked && form.consentimiento_informado && (
            <div className="col-span-2 bg-gray-50 border rounded p-3 text-xs whitespace-pre-line mt-2">
              {form.consentimiento_informado}
            </div>
          )}
          <div className="col-span-2 flex gap-2 justify-end mt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
      {loading && <LoadingSpinner />}
      {/* Ocultar error 403 para LABORATORIO completamente */}
      {error && !(
        user?.role === 'LABORATORIO' &&
        (error === 'Forbidden' || error === 'Request failed with status code 403')
      ) && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
      <Card>
        <Table
          columns={columns}
          data={(data || []).map((r) => ({
            ...r,
            patient:
              r.MedicalRecord && r.MedicalRecord.Patient
                ? `${r.MedicalRecord.Patient.nombres || ''} ${r.MedicalRecord.Patient.primer_apellido || ''} ${r.MedicalRecord.Patient.segundo_apellido || ''}`.trim()
                : '—',
            actions: (
              <RoleGuard roles={['ADMIN', 'LABORATORIO']}>
                <select value={r.status} onChange={e => handleStatus(r.id, e.target.value)} className="border rounded px-2 py-1">
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En proceso</option>
                  <option value="COMPLETADO">Completado</option>
                </select>
              </RoleGuard>
            ),
          }))}
        />
      </Card>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default LabPanel;

import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Table from '../components/Table';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'patientName', label: 'Paciente' },
  { key: 'labRequestId', label: 'Solicitud' },
  { key: 'result', label: 'Resultado' },
  { key: 'file', label: 'Archivo' },
  { key: 'actions', label: '' },
];

const ResultsPanel = () => {
  const { data, loading, error, request } = useApi('/results', 'get');
  const postResultApi = useApi('/results', 'post');
  const labRequestsApi = useApi('/lab', 'get');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ labRequestId: '', result: '', file: null });
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const fetchResults = async () => {
    await request();
  };

  useEffect(() => {
    fetchResults();
    labRequestsApi.request();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
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
      // Si options existen, pásalas como endpointOverride (que es el segundo argumento), pero el hook espera una URL, así que debemos ajustar el hook o no usar el segundo argumento para options.
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
      // Mostrar el error exacto en consola y en pantalla
      console.error('Error al subir resultado:', err, err?.response?.data);
      showToast(`Error al subir resultado: ${err?.response?.data?.message || err.message || 'Error desconocido'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Panel de Resultados</h2>
      <RoleGuard roles={['LABORATORIO']}>
        <button
          className="btn btn-primary mb-4 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg,#22d3ee,#2563eb)', boxShadow: '0 2px 8px #2563eb22' }}
          onClick={() => setShowForm(true)}
        >
          <span className="material-icons-outlined text-lg">upload_file</span>
          Subir resultado
        </button>
      </RoleGuard>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Subir resultado de laboratorio">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">Solicitud</label>
            <select
              name="labRequestId"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition-all bg-white"
              value={form.labRequestId}
              onChange={handleChange}
              required
              disabled={labRequestsApi.loading}
            >
              <option value="">Selecciona una solicitud...</option>
              {Array.isArray(labRequestsApi.data) && labRequestsApi.data.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.MedicalRecord && req.MedicalRecord.Patient
                    ? `${req.MedicalRecord.Patient.nombres || ''} ${req.MedicalRecord.Patient.primer_apellido || ''} ${req.MedicalRecord.Patient.segundo_apellido || ''}`.trim() + ' - ' + req.type
                    : `ID ${req.id} - ${req.type}`}
                </option>
              ))}
            </select>
            {labRequestsApi.loading && <div className="text-xs text-gray-500 mt-1">Cargando solicitudes...</div>}
            {labRequestsApi.error && <div className="text-xs text-red-500 mt-1">Error al cargar solicitudes</div>}
          </div>
          <FormField label="Resultado" name="result" value={form.result} onChange={handleChange} required />
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2 font-semibold">Archivo (opcional)</label>
            <input type="file" name="file" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition-all bg-white" onChange={handleChange} />
          </div>
          <div className="col-span-2 flex gap-2 justify-end mt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
      {loading && <LoadingSpinner />}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <Card>
        <Table
          columns={columns}
          data={(data || []).map((r) => {
            // Obtener nombre completo del paciente si está disponible
            let patientName = '-';
            if (r.LabRequest && r.LabRequest.MedicalRecord && r.LabRequest.MedicalRecord.Patient) {
              const p = r.LabRequest.MedicalRecord.Patient;
              patientName = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();
            }
            return {
              ...r,
              patientName,
              file: r.file ? <a href={`http://localhost:4000${r.file}`} className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">Descargar</a> : '-',
              actions: null,
            };
          })}
        />
      </Card>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default ResultsPanel;

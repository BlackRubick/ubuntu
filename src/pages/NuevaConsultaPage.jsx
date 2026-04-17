import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Card from '../components/Card';
import FormField from '../components/FormField';
import Table from '../components/Table';

const initialForm = {
  patientId: '',
  motivo_consulta: '',
  diagnostico: '',
  tratamiento: '',
  notas_clinicas: '',
};

const columns = [
  { key: 'paciente', label: 'Paciente' },
  { key: 'motivo_consulta', label: 'Motivo' },
  { key: 'diagnostico', label: 'Diagnóstico' },
  { key: 'tratamiento', label: 'Tratamiento' },
  { key: 'notas_clinicas', label: 'Notas clínicas' },
];

const NuevaConsultaPage = () => {
  const { data: consultas, loading: loadingConsultas, error: errorConsultas, request: fetchConsultas } = useApi('/medical-records', 'get');
  const { data: pacientes, loading: loadingPacientes, error: errorPacientes, request: fetchPacientes } = useApi('/patients', 'get');
  const consultaApi = useApi('/medical-records', 'post');
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  useEffect(() => {
    fetchConsultas();
    fetchPacientes();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await consultaApi.request(form);
      showToast('Consulta registrada correctamente', 'success');
      setForm(initialForm);
      setShowForm(false);
      fetchConsultas();
    } catch {
      showToast('Error al registrar consulta', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Mapear datos para la tabla
  const consultasTable = (consultas || []).map((c) => ({
    ...c,
    paciente: c.Patient ? `${c.Patient.nombres || ''} ${c.Patient.primer_apellido || ''} ${c.Patient.segundo_apellido || ''}`.trim() : '',
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Consultas</h2>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">Historial de consultas</span>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowForm(true)}>
            Nueva consulta
          </button>
        </div>
        {loadingConsultas ? <LoadingSpinner /> : (
          <Table columns={columns} data={consultasTable} />
        )}
        {errorConsultas && <div className="text-red-600 mt-2">{errorConsultas}</div>}
      </Card>

      {/* Modal/Formulario para nueva consulta */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Registrar nueva consulta</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Paciente</label>
                <select
                  name="patientId"
                  value={form.patientId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                >
                  <option value="">Selecciona un paciente</option>
                  {pacientes && pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.primer_apellido} {p.segundo_apellido}
                    </option>
                  ))}
                </select>
              </div>
              <FormField label="Motivo de la consulta" name="motivo_consulta" value={form.motivo_consulta} onChange={handleChange} required />
              <FormField label="Diagnóstico" name="diagnostico" value={form.diagnostico} onChange={handleChange} required />
              <FormField label="Tratamiento" name="tratamiento" value={form.tratamiento} onChange={handleChange} required />
              <FormField label="Notas clínicas" name="notas_clinicas" value={form.notas_clinicas} onChange={handleChange} />
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-4 py-2 rounded"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar consulta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      {loadingPacientes && <LoadingSpinner />}
      {errorPacientes && <div className="text-red-600 mt-4">{errorPacientes}</div>}
    </div>
  );
};

export default NuevaConsultaPage;

import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import FormField from '../components/FormField';

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
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => { /* MISMA LOGICA */ };

  const consultasTable = (consultas || []).map((c) => ({
    ...c,
    paciente: c.Patient
      ? `${c.Patient.nombres || ''} ${c.Patient.primer_apellido || ''} ${c.Patient.segundo_apellido || ''}`.trim()
      : '',
  }));

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Consultas</h1>
          <p className="text-sm text-gray-400">Registro y seguimiento clínico</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="h-9 px-4 rounded-lg text-sm font-medium text-[#E6F1FB]"
          style={{ background: '#0C447C' }}
        >
          + Nueva consulta
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-[11px] text-gray-400">Total consultas</div>
          <div className="text-2xl font-medium text-gray-900">{consultasTable.length}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="text-[11px] text-gray-400">Pacientes</div>
          <div className="text-2xl font-medium text-gray-900">{pacientes?.length || 0}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map(c => (
                <th key={c.key} className="px-4 py-2 text-left text-[11px] text-gray-400">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loadingConsultas ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  <LoadingSpinner /> Cargando...
                </td>
              </tr>
            ) : consultasTable.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">
                  No hay consultas registradas
                </td>
              </tr>
            ) : consultasTable.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{c.paciente}</td>
                <td className="px-4 py-3 text-gray-600">{c.motivo_consulta}</td>
                <td className="px-4 py-3 text-gray-600">{c.diagnostico}</td>
                <td className="px-4 py-3 text-gray-600">{c.tratamiento}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {errorConsultas && (
          <div className="p-4 text-red-500 text-sm">{errorConsultas}</div>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl border border-gray-100 w-full max-w-xl overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Nueva consulta</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Paciente */}
                <div className="col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 block">Paciente</label>
                  <select
                    name="patientId"
                    value={form.patientId}
                    onChange={handleChange}
                    required
                    className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Selecciona...</option>
                    {pacientes?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} {p.primer_apellido} {p.segundo_apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <FormField label="Motivo consulta" name="motivo_consulta" value={form.motivo_consulta} onChange={handleChange} required />
                <FormField label="Diagnóstico" name="diagnostico" value={form.diagnostico} onChange={handleChange} required />
                <FormField label="Tratamiento" name="tratamiento" value={form.tratamiento} onChange={handleChange} required />
                <FormField label="Notas clínicas" name="notas_clinicas" value={form.notas_clinicas} onChange={handleChange} />

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-8 px-4 text-sm border border-gray-200 rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-8 px-4 text-sm text-white rounded-lg"
                  style={{ background: '#0C447C' }}
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {loadingPacientes && <div className="mt-4 text-sm text-gray-400"><LoadingSpinner /> Cargando pacientes...</div>}
      {errorPacientes && <div className="text-red-500 mt-4 text-sm">{errorPacientes}</div>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default NuevaConsultaPage;
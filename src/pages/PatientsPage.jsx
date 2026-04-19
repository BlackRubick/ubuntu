import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Table from '../components/Table';
import FormField from '../components/FormField';
import Card from '../components/Card';
import Modal from '../components/Modal';
import RoleGuard from '../components/RoleGuard';
import useAuthStore from '../store/useAuthStore';

const columns = [
  { key: 'nombre_completo', label: 'Nombre completo' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'curp', label: 'CURP' },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'estado_civil', label: 'Estado civil' },
  { key: 'domicilio', label: 'Domicilio' },
  { key: 'actions', label: '' },
];

const initialForm = {
  nss: '',
  nombres: '',
  primer_apellido: '',
  segundo_apellido: '',
  sexo: '',
  curp: '',
  fecha_nacimiento: '',
  nacionalidad: '',
  estado_nacimiento: '',
  estado_residencia: '',
  municipio_residencia: '',
  localidad_residencia: '',
  estado_civil: '',
  domicilio: '',
  telefono: '',
};

const PatientsPage = () => {
  const { data, loading, error, request } = useApi('/patients', 'get');

  // Log para depuración de datos recibidos
  useEffect(() => {
    if (data) {
      console.log('Pacientes recibidos:', data);
    }
  }, [data]);
  const postApi = useApi('/patients', 'post');

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // 🔹 Obtener pacientes
  const fetchPatients = async (q = '') => {
    await request({ params: q ? { q } : {} });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // 🔹 Buscar
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  // 🔹 Manejar inputs
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar duplicado por NSS antes de enviar
    const nssExists = (data || []).some(
      (p) => p.nss && form.nss && p.nss.trim() === form.nss.trim()
    );
    if (nssExists) {
      showToast('Ya existe un paciente con ese NSS', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await postApi.request(form);
      showToast('Paciente creado correctamente', 'success');
      setShowForm(false);
      setForm(initialForm);
      fetchPatients();
    } catch (err) {
      showToast('Error al crear paciente', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Pacientes</h2>

      {/* 🔍 Buscador + botón */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="px-3 py-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
            Buscar
          </button>
        </form>

        <RoleGuard roles={['ADMIN', 'MEDICO']}>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => setShowForm(true)}
          >
            Nuevo paciente
          </button>
        </RoleGuard>
      </div>

      {/* 📋 Tabla */}
      {loading && <LoadingSpinner />}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <Card>
        <Table
          columns={columns}
          data={(data || []).map((p) => ({
            ...p,
            nombre_completo: `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim(),
            actions: (
              <button
                className="text-blue-700 underline"
                onClick={() => navigate(`/patients/${p.id}`)}
              >
                Ver
              </button>
            ),
          }))}
        />
      </Card>

      {/* 🧾 Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6 overflow-y-auto max-h-[90vh]">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <FormField label="NSS (Número de Seguro Social)" name="nss" value={form.nss} onChange={handleChange} required />
            <FormField label="Nombre(s)" name="nombres" value={form.nombres} onChange={handleChange} required />
            <FormField label="Primer apellido" name="primer_apellido" value={form.primer_apellido} onChange={handleChange} required />
            <FormField label="Segundo apellido" name="segundo_apellido" value={form.segundo_apellido} onChange={handleChange} />
            <FormField label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} required />
            <FormField label="CURP" name="curp" value={form.curp} onChange={handleChange} />
            <FormField label="Fecha de nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required />
            <FormField label="Nacionalidad" name="nacionalidad" value={form.nacionalidad} onChange={handleChange} />
            <FormField label="Estado nacimiento" name="estado_nacimiento" value={form.estado_nacimiento} onChange={handleChange} />
            <FormField label="Estado residencia" name="estado_residencia" value={form.estado_residencia} onChange={handleChange} />
            <FormField label="Municipio residencia" name="municipio_residencia" value={form.municipio_residencia} onChange={handleChange} />
            <FormField label="Localidad/Barrio" name="localidad_residencia" value={form.localidad_residencia} onChange={handleChange} />
            <FormField label="Estado civil" name="estado_civil" value={form.estado_civil} onChange={handleChange} />
            <FormField label="Domicilio" name="domicilio" value={form.domicilio} onChange={handleChange} />
            <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />

            <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 rounded"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 🔔 Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};


// Exportación por defecto para la lista de pacientes
export default PatientsPage;
// Exportación nombrada para el detalle
export { default as PatientDetailPage } from './PatientDetailPage';
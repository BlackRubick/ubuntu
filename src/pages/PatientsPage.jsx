import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
const initialForm = {
  nss: '', nombres: '', primer_apellido: '', segundo_apellido: '',
  sexo: '', curp: '', fecha_nacimiento: '', nacionalidad: '',
  estado_nacimiento: '', estado_residencia: '', municipio_residencia: '',
  localidad_residencia: '', estado_civil: '', domicilio: '', telefono: '',
};

const getInitials = (p) => {
  const n = p.nombres?.[0] || '';
  const a = p.primer_apellido?.[0] || '';
  return (n + a).toUpperCase() || '?';
};

const AVATAR_COLORS = [
  { bg: '#E6F1FB', text: '#0C447C' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#FBEAF0', text: '#72243E' },
];

const PatientsPage = () => {
  const { data, loading, error, request } = useApi('/patients', 'get');
  const postApi = useApi('/patients', 'post');

  useEffect(() => {
    if (data) console.log('Pacientes recibidos:', data);
  }, [data]);

  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const putApi = useApi('/patients', 'put');
  const deleteApi = useApi('/patients', 'delete');

  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const fetchPatients = async (q = '') => {
    await request({ params: q ? { q } : {} });
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchPatients(search); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const handleEdit = (p) => {
    setEditing(p);
    setForm({ ...p });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este paciente?')) return;
    try {
      await deleteApi.request(null, `/patients/${id}`);
      showToast('Paciente eliminado', 'success');
      fetchPatients();
    } catch {
      showToast('Error al eliminar paciente', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      try {
        setSubmitting(true);
        await putApi.request(form, `/patients/${editing.id}`);
        showToast('Paciente actualizado', 'success');
        setShowForm(false);
        setForm(initialForm);
        setEditing(null);
        fetchPatients();
      } catch {
        showToast('Error al actualizar paciente', 'error');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const nssExists = (data || []).some(
      (p) => p.nss && form.nss && p.nss.trim() === form.nss.trim()
    );
    if (nssExists) { showToast('Ya existe un paciente con ese NSS', 'error'); return; }
    try {
      setSubmitting(true);
      await postApi.request(form);
      showToast('Paciente creado correctamente', 'success');
      setShowForm(false);
      setForm(initialForm);
      fetchPatients();
    } catch {
      showToast('Error al crear paciente', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const patients = data || [];

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión y registro de pacientes del sistema</p>
        </div>
        <RoleGuard roles={['ADMIN', 'MEDICO']}>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#E6F1FB] transition active:scale-[0.98]"
            style={{ background: '#0C447C' }}
            onMouseEnter={e => e.currentTarget.style.background = '#185FA5'}
            onMouseLeave={e => e.currentTarget.style.background = '#0C447C'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M7 2v10M2 7h10" />
            </svg>
            Nuevo paciente
          </button>
        </RoleGuard>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden flex-1 min-w-[200px] max-w-sm">
          <span className="px-2.5 text-gray-400 flex items-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="6" cy="6" r="4" /><path d="M10 10l2.5 2.5" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o CURP..."
            className="flex-1 h-9 bg-transparent text-sm text-gray-900 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="h-9 px-3 text-xs font-medium text-[#E6F1FB]"
            style={{ background: '#0C447C' }}
          >
            Buscar
          </button>
        </form>
        {!loading && (
          <span className="text-xs text-gray-400 ml-auto">
            {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'}
          </span>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <LoadingSpinner /> Cargando pacientes...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Paciente', 'Sexo', 'CURP', 'Fecha nac.', 'Teléfono', 'Estado civil', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  No hay pacientes registrados
                </td>
              </tr>
            ) : patients.map((p, i) => {
              const colors = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const nombre = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.trim();
              return (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {getInitials(p)}
                      </div>
                      <span className="text-gray-900">{nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={p.sexo?.toLowerCase().startsWith('f')
                        ? { background: '#FBEAF0', color: '#72243E' }
                        : { background: '#E6F1FB', color: '#0C447C' }}
                    >
                      {p.sexo || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{p.curp || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.fecha_nacimiento || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.telefono || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.estado_civil || '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          let expediente = (p.MedicalRecords || []).find(r => r.patientId === p.id);
                          if (!expediente) {
                            showToast('Creando expediente...', 'info');
                            await api.post('/medical-records', {
                              patientId: p.id,
                              motivo_consulta: '',
                              diagnostico: '',
                              tratamiento: '',
                              notas_clinicas: '',
                            });
                            showToast('Expediente creado', 'success');
                          }
                          navigate(`/patients/${p.id}`);
                        } catch (err) {
                          console.error(err);
                          showToast('Error al crear expediente', 'error');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-[#B5D4F4] text-[#185FA5] hover:bg-[#E6F1FB] transition-colors"
                    >
                      Ver
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 6h8M6 2l4 4-4 4" />
                      </svg>
                    </button>
                    {/* Solo ADMIN y MEDICO pueden editar/borrar */}
                    {(user?.role === 'ADMIN' || user?.role === 'MEDICO') && (
                      <>
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}>
        <div className="w-full max-w-lg mx-auto bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-medium text-gray-900">{editing ? 'Editar paciente' : 'Registrar nuevo paciente'}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Completa los campos requeridos</p>
            </div>
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* Modal body */}
          <form onSubmit={handleSubmit}>
            <div className="px-5 py-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {[
                { label: 'NSS', name: 'nss', required: true },
                { label: 'Nombre(s)', name: 'nombres', required: true },
                { label: 'Primer apellido', name: 'primer_apellido', required: true },
                { label: 'Segundo apellido', name: 'segundo_apellido' },
                { label: 'Sexo', name: 'sexo', required: true },
                { label: 'Fecha de nacimiento', name: 'fecha_nacimiento', type: 'date', required: true },
                { label: 'CURP', name: 'curp' },
                { label: 'Teléfono', name: 'telefono' },
                { label: 'Estado civil', name: 'estado_civil' },
                { label: 'Nacionalidad', name: 'nacionalidad' },
                { label: 'Estado de nacimiento', name: 'estado_nacimiento' },
                { label: 'Estado de residencia', name: 'estado_residencia' },
                { label: 'Municipio', name: 'municipio_residencia' },
                { label: 'Localidad / Barrio', name: 'localidad_residencia' },
              ].map(({ label, name, type, required }) => (
                <div key={name}>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type={type || 'text'}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                    className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition"
                    disabled={editing && name === 'nss'}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Domicilio completo</label>
                <input
                  type="text"
                  name="domicilio"
                  value={form.domicilio}
                  onChange={handleChange}
                  placeholder="Calle, número, colonia..."
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
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
                {submitting ? 'Guardando...' : (editing ? 'Actualizar paciente' : 'Guardar paciente')}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default PatientsPage;
export { default as PatientDetailPage } from './PatientDetailPage';
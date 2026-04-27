import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import useAuthStore from '../store/useAuthStore';

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
];

const roleStyles = {
  ADMIN: { bg: '#E6F1FB', color: '#0C447C' },
  DIRECTOR: { bg: '#F3E8FF', color: '#6B21A8' },
  MEDICO: { bg: '#EAF3DE', color: '#27500A' },
  LABORATORIO: { bg: '#FAEEDA', color: '#633806' },
};

const UsersPage = () => {
  const { data, loading, error, request } = useApi('/users', 'get');
  const postApi = useApi('/users', 'post');
  const putApi = useApi('', 'put');
  const deleteApi = useApi('', 'delete');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', name: '', email: '', role: 'MEDICO', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);

  const fetchUsers = async () => { await request(); };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => { /* MISMA LOGICA */ };
  const handleEdit = (u) => { /* MISMA LOGICA */ };
  const handleDelete = async (id) => { /* MISMA LOGICA */ };

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-400">Gestión de cuentas del sistema</p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({ username: '', name: '', email: '', role: 'MEDICO', password: '' });
          }}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#E6F1FB]"
          style={{ background: '#0C447C' }}
        >
          + Nuevo usuario
        </button>
      </div>

      {/* STATES */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <LoadingSpinner /> Cargando usuarios...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Usuario', 'Nombre', 'Email', 'Rol', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? data.map(u => {
              const roleStyle = roleStyles[u.role] || roleStyles.MEDICO;

              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{u.username}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>

                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: roleStyle.bg, color: roleStyle.color }}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-4 py-3 flex gap-3 text-sm">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-[#0C447C] hover:underline"
                    >
                      Editar
                    </button>

                    {u.id !== user.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden w-full max-w-xl">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">
              {editing ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">

              <FormField label="Usuario" name="username" value={form.username} onChange={handleChange} required />
              <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} required />
              <FormField label="Email" name="email" value={form.email} onChange={handleChange} required type="email" />

              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">Rol</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <FormField label="Contraseña" name="password" value={form.password} onChange={handleChange} required type="password" />

            </div>

            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-8 px-4 text-sm text-gray-500 border border-gray-200 rounded-lg"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="h-8 px-4 text-sm font-medium text-[#E6F1FB] rounded-lg disabled:opacity-50"
                style={{ background: '#0C447C' }}
              >
                {submitting ? 'Guardando...' : (editing ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default UsersPage;
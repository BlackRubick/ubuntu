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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await putApi.request(form, `/users/${editing.id}`);
        showToast('Usuario actualizado', 'success');
      } else {
        await postApi.request(form);
        showToast('Usuario creado', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ username: '', name: '', email: '', role: 'MEDICO', password: '' });
      fetchUsers();
    } catch (err) {
      showToast('Error al guardar usuario', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u) => {
    setEditing(u);
    setForm({
      username: u.username || '',
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'MEDICO',
      password: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setSubmitting(true);
    try {
      await deleteApi.request(null, `/users/${id}`);
      showToast('Usuario eliminado', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Error al eliminar usuario', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // ← menos padding en móvil
    <div className="px-3 py-4 sm:p-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      {/* ← apila verticalmente en móvil, botón full-width */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#E6F1FB]"
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

      {/* ── VISTA DESKTOP: tabla ── */}
      <div className="hidden sm:block bg-white border border-gray-100 rounded-xl overflow-hidden">
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
                    <button onClick={() => handleEdit(u)} className="text-[#0C447C] hover:underline">
                      Editar
                    </button>
                    {u.id !== user.id && (
                      <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:underline">
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

      {/* ── VISTA MÓVIL: cards ── */}
      <div className="sm:hidden bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
        {data && data.length > 0 ? data.map(u => {
          const roleStyle = roleStyles[u.role] || roleStyles.MEDICO;
          return (
            <div key={u.id} className="px-4 py-3 flex flex-col gap-2">
              {/* Fila 1: username + rol */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{u.username}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ background: roleStyle.bg, color: roleStyle.color }}
                >
                  {u.role}
                </span>
              </div>
              {/* Fila 2: nombre */}
              <div className="text-sm text-gray-700">{u.name}</div>
              {/* Fila 3: email */}
              <div className="text-xs text-gray-400">{u.email}</div>
              {/* Fila 4: acciones */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleEdit(u)}
                  className="text-xs font-medium text-[#0C447C] border border-[#85B7EB] bg-[#E6F1FB] px-3 py-1 rounded-md"
                >
                  Editar
                </button>
                {u.id !== user.id && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-xs font-medium text-red-500 border border-red-200 bg-red-50 px-3 py-1 rounded-md"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <p className="text-center py-10 text-gray-400 text-sm">No hay usuarios registrados</p>
        )}
      </div>

      {/* MODAL */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden w-full sm:max-w-xl">

          {/* Header */}
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">
              {editing ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ← 1 col en móvil, 2 cols en md */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              <FormField label="Usuario"     name="username" value={form.username} onChange={handleChange} required />
              <FormField label="Nombre"      name="name"     value={form.name}     onChange={handleChange} required />
              <FormField label="Email"       name="email"    value={form.email}    onChange={handleChange} required type="email" />

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

            <div className="flex justify-end gap-2 px-4 sm:px-5 py-3 border-t border-gray-100">
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
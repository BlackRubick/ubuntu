import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Card from '../components/Card';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import useAuthStore from '../store/useAuthStore';

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
];

const UsersPage = () => {
  const { data, loading, error, request } = useApi('/users', 'get');
  const postApi = useApi('/users', 'post');
  const putApi = useApi('', 'put'); // endpoint se ajusta dinámicamente
  const deleteApi = useApi('', 'delete');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', name: '', email: '', role: 'MEDICO', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);

  const fetchUsers = async () => {
    await request();
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await putApi.request(form, `/users/${editing}`);
        showToast('Usuario actualizado', 'success');
      } else {
        await postApi.request(form);
        showToast('Usuario creado', 'success');
      }
      setShowForm(false);
      setForm({ username: '', name: '', email: '', role: 'MEDICO', password: '' });
      setEditing(null);
      fetchUsers();
    } catch {
      showToast('Error al guardar usuario', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u) => {
    setEditing(u.id);
    setForm({ ...u, password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    try {
      deleteApi.endpoint = `/users/${id}`;
      await deleteApi.request();
      showToast('Usuario eliminado', 'success');
      fetchUsers();
    } catch {
      showToast('Error al eliminar usuario', 'error');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Gestión de Usuarios</h2>
      <button className="bg-blue-700 text-white px-4 py-2 rounded mb-4" onClick={() => { setShowForm(true); setEditing(null); setForm({ username: '', name: '', email: '', role: 'MEDICO', password: '' }); }}>Nuevo usuario</button>
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <h3 className="text-xl font-semibold mb-4 text-blue-700">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Usuario" name="username" value={form.username} onChange={handleChange} required />
          <FormField label="Nombre" name="name" value={form.name} onChange={handleChange} required />
          <FormField label="Email" name="email" value={form.email} onChange={handleChange} required type="email" />
          <div>
            <label className="block text-gray-700 mb-1">Rol</label>
            <select name="role" className="w-full px-3 py-2 border rounded" value={form.role} onChange={handleChange} required>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <FormField label="Contraseña" name="password" value={form.password} onChange={handleChange} required type="password" />
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800" disabled={submitting}>{submitting ? 'Guardando...' : (editing ? 'Actualizar' : 'Guardar')}</button>
          </div>
        </form>
      </Modal>
      {loading && <LoadingSpinner />}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2">Usuario</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Email</th>
                <th className="p-2">Rol</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? data.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-700 hover:underline" onClick={() => handleEdit(u)}>Editar</button>
                    {u.id !== user.id && <button className="text-red-600 hover:underline" onClick={() => handleDelete(u.id)}>Eliminar</button>}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-4">Sin usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default UsersPage;

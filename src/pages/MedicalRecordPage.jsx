import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Card from '../components/Card';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';
import useAuthStore from '../store/useAuthStore';

const MedicalRecordPage = () => {
  const { id } = useParams();
  const { data, loading, error, request } = useApi(`/medical-records/${id}`, 'get');
  const updateApi = useApi(`/medical-records/${id}`, 'put');
  const postNoteApi = useApi(`/medical-records/${id}/notes`, 'post');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState({ motivo_consulta: '', diagnostico: '', tratamiento: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    request();
    // eslint-disable-next-line
  }, [id]);

  // Sincronizar datos al abrir para edición
  useEffect(() => {
    if (data) {
      setEditForm({
        motivo_consulta: data.motivo_consulta || '',
        diagnostico: data.diagnostico || '',
        tratamiento: data.tratamiento || '',
      });
    }
  }, [data]);
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateApi.request(editForm);
      showToast('Expediente actualizado', 'success');
      setEditing(false);
      request();
    } catch {
      showToast('Error al actualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await postNoteApi.request({ note });
      showToast('Nota agregada', 'success');
      setNote('');
      request();
    } catch {
      showToast('Error al agregar nota', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 p-6">{error}</div>;
  if (!data) return null;

  const { Patient, motivo_consulta, diagnostico, tratamiento, notas_clinicas } = data;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Expediente Clínico</h2>
      <Card className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-gray-600">Datos del paciente</div>
            <div className="text-xl font-bold text-blue-700">{Patient?.nombres} {Patient?.primer_apellido} {Patient?.segundo_apellido}</div>
            <div className="text-gray-500">Sexo: {Patient?.sexo}</div>
            <div className="text-gray-500">CURP: {Patient?.curp}</div>
            <div className="text-gray-500">Fecha de nacimiento: {Patient?.fecha_nacimiento ? Patient?.fecha_nacimiento.split('T')[0] : ''}</div>
            <div className="text-gray-500">Nacionalidad: {Patient?.nacionalidad}</div>
            <div className="text-gray-500">Estado nacimiento: {Patient?.estado_nacimiento}</div>
            <div className="text-gray-500">Estado residencia: {Patient?.estado_residencia}</div>
            <div className="text-gray-500">Municipio residencia: {Patient?.municipio_residencia}</div>
            <div className="text-gray-500">Localidad/Barrio: {Patient?.localidad_residencia}</div>
            <div className="text-gray-500">Estado civil: {Patient?.estado_civil}</div>
            <div className="text-gray-500">Domicilio: {Patient?.domicilio}</div>
            <div className="text-gray-500">Teléfono: {Patient?.telefono}</div>
          </div>
          <div>
            {editing ? (
              <form onSubmit={handleEditSubmit} className="space-y-2">
                <FormField label="Motivo consulta" name="motivo_consulta" value={editForm.motivo_consulta} onChange={handleEditChange} required />
                <FormField label="Diagnóstico" name="diagnostico" value={editForm.diagnostico} onChange={handleEditChange} required />
                <FormField label="Tratamiento" name="tratamiento" value={editForm.tratamiento} onChange={handleEditChange} required />
                <div className="flex gap-2 mt-2">
                  <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
                  <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-2"><span className="font-semibold">Motivo consulta:</span> {motivo_consulta}</div>
                <div className="mb-2"><span className="font-semibold">Diagnóstico:</span> {diagnostico}</div>
                <div className="mb-2"><span className="font-semibold">Tratamiento:</span> {tratamiento}</div>
                <RoleGuard roles={['ADMIN', 'MEDICO']}>
                  <button className="bg-blue-700 text-white px-4 py-2 rounded mt-2" onClick={() => setEditing(true)}>Editar</button>
                </RoleGuard>
              </>
            )}
          </div>
        </div>
      </Card>
      <Card className="mb-4">
        <div className="font-semibold mb-2">Notas médicas</div>
        <div className="whitespace-pre-line bg-gray-50 rounded p-2 mb-2 min-h-[60px]">{notas_clinicas || 'Sin notas'}</div>
        <RoleGuard roles={['ADMIN', 'MEDICO']}>
          <form onSubmit={handleAddNote} className="flex gap-2 mt-2">
            <FormField label="Agregar nota" value={note} onChange={e => setNote(e.target.value)} required className="flex-1" />
            <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" disabled={adding}>{adding ? 'Guardando...' : 'Agregar'}</button>
          </form>
        </RoleGuard>
      </Card>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default MedicalRecordPage;

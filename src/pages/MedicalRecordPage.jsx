import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import FormField from '../components/FormField';
import RoleGuard from '../components/RoleGuard';
import useAuthStore from '../store/useAuthStore';

const MedicalRecordPage = () => {
  const { id } = useParams();
  const { data, loading, error, request } = useApi(`/medical-records/patient/${id}`, 'get');
const updateApi = useApi(
  data ? `/medical-records/${data.id}` : null,
  'put'
);

const postNoteApi = useApi(
  data ? `/medical-records/${data.id}/notes` : null,
  'post'
);

  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState({ motivo_consulta: '', diagnostico: '', tratamiento: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { toast, showToast, closeToast } = useToast();
  const user = useAuthStore((s) => s.user);

  useEffect(() => { request(); }, [id]);

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
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateApi.request(editForm);
      showToast('Expediente actualizado', 'success');
      setEditing(false);
      request(); // Refresca los datos sin recargar la página
    } catch (err) {
      showToast('Error al actualizar', 'error');
    } finally {
      setSaving(false);
    }
  };
  const handleAddNote = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await postNoteApi.request({ nota: note });
      showToast('Nota agregada', 'success');
      setNote('');
      request(); // Refresca los datos para mostrar la nueva nota
    } catch (err) {
      showToast('Error al agregar nota', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-400 flex items-center gap-2">
        <LoadingSpinner /> Cargando expediente...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { Patient, motivo_consulta, diagnostico, tratamiento, notas_clinicas } = data;

  const fullName = `${Patient?.nombres || ''} ${Patient?.primer_apellido || ''} ${Patient?.segundo_apellido || ''}`.trim();

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Expediente clínico</h1>
        <p className="text-sm text-gray-400">Detalle médico y seguimiento del paciente</p>
      </div>

      {/* PACIENTE */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5">

        <div className="mb-4">
          <div className="text-[11px] text-gray-400">Paciente</div>
          <div className="text-lg font-medium text-gray-900">{fullName || '—'}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Sexo', value: Patient?.sexo },
            { label: 'CURP', value: Patient?.curp },
            { label: 'Nacimiento', value: Patient?.fecha_nacimiento?.split('T')[0] },
            { label: 'Nacionalidad', value: Patient?.nacionalidad },
            { label: 'Estado', value: Patient?.estado_residencia },
            { label: 'Municipio', value: Patient?.municipio_residencia },
            { label: 'Teléfono', value: Patient?.telefono },
          ].map(i => (
            <div key={i.label}>
              <div className="text-[11px] text-gray-400">{i.label}</div>
              <div className="text-gray-900">{i.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EXPEDIENTE */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-900">Información clínica</h2>

          {!editing && (
            <RoleGuard roles={['ADMIN', 'MEDICO']}>
              <button
                onClick={() => setEditing(true)}
                className="h-8 px-3 text-sm rounded-lg text-[#E6F1FB]"
                style={{ background: '#0C447C' }}
              >
                Editar
              </button>
            </RoleGuard>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleEditSubmit} className="grid gap-3">
            <FormField label="Motivo consulta" name="motivo_consulta" value={editForm.motivo_consulta} onChange={handleEditChange} required />
            <FormField label="Diagnóstico" name="diagnostico" value={editForm.diagnostico} onChange={handleEditChange} required />
            <FormField label="Tratamiento" name="tratamiento" value={editForm.tratamiento} onChange={handleEditChange} required />

            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setEditing(false)} className="h-8 px-4 text-sm border border-gray-200 rounded-lg">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="h-8 px-4 text-sm text-white rounded-lg" style={{ background: '#0C447C' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-[11px] text-gray-400">Motivo</div>
              <div className="text-gray-900">{motivo_consulta || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400">Diagnóstico</div>
              <div className="text-gray-900">{diagnostico || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400">Tratamiento</div>
              <div className="text-gray-900">{tratamiento || '—'}</div>
            </div>
          </div>
        )}
      </div>

      {/* NOTAS */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">

        <h2 className="text-sm font-medium text-gray-900 mb-3">Notas médicas</h2>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[12px] text-gray-600 whitespace-pre-wrap min-h-[80px] mb-3">
          {notas_clinicas || 'Sin notas registradas'}
        </div>

        <RoleGuard roles={['ADMIN', 'MEDICO']}>
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Escribe una nota clínica..."
              className="flex-1 h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="h-9 px-4 text-sm text-white rounded-lg"
              style={{ background: '#0C447C' }}
            >
              {adding ? 'Guardando...' : 'Agregar'}
            </button>
          </form>
        </RoleGuard>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default MedicalRecordPage;
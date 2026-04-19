import React, { useState } from 'react';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import useExportData from '../hooks/useExportData';

const ImportExportPage = () => {
  const [selectedType, setSelectedType] = useState('expediente'); // expediente o lab
  const [selectedRecord, setSelectedRecord] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importContent, setImportContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const { patients, medicalRecords, labResults, loading: loadingData, error } = useExportData();

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = '';
      let filename = '';
      if (selectedType === 'expediente') {
        url = `/files/export/${selectedRecord}`;
        const rec = medicalRecords.find(r => r.id === Number(selectedRecord));
        const p = rec && rec.Patient ? `${rec.Patient.nombres || ''}_${rec.Patient.primer_apellido || ''}_${rec.Patient.segundo_apellido || ''}`.replace(/ /g, '_') : selectedRecord;
        filename = `expediente_${p}.txt`;
      } else {
        url = `/files/export-lab/${selectedLab}`;
        const lab = labResults.find(l => l.id === Number(selectedLab));
        let p = lab && lab.LabRequest && lab.LabRequest.MedicalRecord && lab.LabRequest.MedicalRecord.Patient ? `${lab.LabRequest.MedicalRecord.Patient.nombres || ''}_${lab.LabRequest.MedicalRecord.Patient.primer_apellido || ''}_${lab.LabRequest.MedicalRecord.Patient.segundo_apellido || ''}`.replace(/ /g, '_') : selectedLab;
        filename = `labresult_${p}.txt`;
      }
      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Archivo exportado', 'success');
    } catch {
      showToast('Error al exportar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await api.post('/files/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportContent(res.data.content);
      showToast('Archivo importado', 'success');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        showToast('No tienes permisos para importar. Solo un usuario ADMIN puede importar expedientes.', 'error');
      } else {
        showToast('Error al importar', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Estado para PDF
  const [selectedPatientPdf, setSelectedPatientPdf] = useState('');

  const handleExportPdf = async (e) => {
    e.preventDefault();
    if (!selectedPatientPdf) return;
    setLoading(true);
    try {
      // Buscar el expediente médico principal del paciente seleccionado
      const record = medicalRecords.find(r => r.Patient && r.Patient.id === Number(selectedPatientPdf));
      if (!record) throw new Error('No se encontró expediente para este paciente');
      const url = `/files/export-pdf/${record.id}`;
      const p = record.Patient;
      const filename = `expediente_${p.nombres || ''}_${p.primer_apellido || ''}_${p.segundo_apellido || ''}.pdf`.replace(/ /g, '_');
      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Expediente PDF exportado', 'success');
    } catch (err) {
      showToast('Error al exportar PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Importar / Exportar Expediente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ...existing code... */}
        <Card>
          <form onSubmit={handleExport} className="flex flex-col gap-2">
            {/* ...existing code... */}
          </form>
        </Card>
        <Card>
          <form onSubmit={handleImport} className="flex flex-col gap-2">
            {/* ...existing code... */}
          </form>
          {importContent && (
            <div className="mt-4 bg-gray-50 p-2 rounded text-sm whitespace-pre-line">
              <span className="font-semibold">Contenido importado:</span>
              <div>{importContent}</div>
            </div>
          )}
        </Card>
      </div>

      {/* Sección PDF */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-2 text-blue-700">Descargar expediente clínico en PDF</h3>
        <form onSubmit={handleExportPdf} className="flex flex-col gap-2 max-w-md">
          <label>Selecciona paciente</label>
          <select value={selectedPatientPdf} onChange={e => setSelectedPatientPdf(e.target.value)} className="px-3 py-2 border rounded" required>
            <option value="">-- Selecciona --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombres} {p.primer_apellido} {p.segundo_apellido}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" disabled={loading || loadingData || !selectedPatientPdf}>
            Descargar expediente clínico en PDF
          </button>
        </form>
      </div>

      {(loading || loadingData) && <LoadingSpinner />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default ImportExportPage;

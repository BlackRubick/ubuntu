// Hook para obtener pacientes, expedientes y resultados de laboratorio
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useExportData() {
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [patientsRes, recordsRes, labsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/medical-records'),
          api.get('/results'),
        ]);
        setPatients(patientsRes.data || []);
        setMedicalRecords(recordsRes.data || []);
        setLabResults(labsRes.data || []);
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return { patients, medicalRecords, labResults, loading, error };
}

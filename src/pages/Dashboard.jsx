import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';

const Dashboard = () => {
  const { data, loading, error, request } = useApi('/stats', 'get');

  useEffect(() => {
    request();
    // eslint-disable-next-line
  }, []); // Solo ejecutar una vez al montar

  const stats = data || { totalPatients: 0, totalStudies: 0, studiesByType: [] };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Dashboard</h2>
      {loading && <LoadingSpinner />}
      {error && (error === 'Forbidden' || error === 'Request failed with status code 403') ? (
        <div className="text-red-600 text-2xl font-bold mb-4">Acceso denegado</div>
      ) : error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-gray-500">Total Pacientes</div>
          <div className="text-3xl font-bold text-blue-700">{stats.totalPatients}</div>
        </Card>
        <Card>
          <div className="text-gray-500">Total Estudios</div>
          <div className="text-3xl font-bold text-blue-700">{stats.totalStudies}</div>
        </Card>
        <Card>
          <div className="text-gray-500">Estudios por tipo</div>
          <ul className="mt-2">
            {stats.studiesByType && stats.studiesByType.length > 0 ? stats.studiesByType.map((s) => (
              <li key={s.type} className="flex justify-between"><span>{s.type}</span><span className="font-bold">{s.count || s["count"]}</span></li>
            )) : <li>-</li>}
          </ul>
        </Card>
      </div>
      <Card>
        <div className="font-semibold mb-2">Estudios por tipo (Gráfica)</div>
        <div style={{ width: '100%', minWidth: 300, height: 300, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.studiesByType || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#185FA5', '#0F6E56', '#534AB7', '#993C1D', '#BA7517', '#993556'];

const MetricCard = ({ icon, label, value, sub, iconBg, iconColor }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-1">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
      style={{ background: iconBg }}
    >
      {icon(iconColor)}
    </div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-3xl font-medium text-gray-900 leading-none">{value}</div>
    <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
  </div>
);

const iconPatient = (color) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
  </svg>
);
const iconStudy = (color) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="2" width="12" height="12" rx="2" /><path d="M8 5v6M5 8h6" />
  </svg>
);
const iconChart = (color) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 12 L5 8 L8 10 L11 5 L14 7" /><circle cx="14" cy="7" r="1.5" fill={color} stroke="none" />
  </svg>
);

const Dashboard = () => {
  const { data, loading, error, request } = useApi('/stats', 'get');

  useEffect(() => {
    request();
    // eslint-disable-next-line
  }, []);

  const stats = data || { totalPatients: 0, totalStudies: 0, studiesByType: [] };
  const types = stats.studiesByType || [];
  const maxCount = Math.max(...types.map(s => s.count || s['count'] || 0), 1);

  const isForbidden = error === 'Forbidden' || error === 'Request failed with status code 403';

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Panel de control</h1>
          <p className="text-sm text-gray-400 mt-0.5">Resumen operativo del sistema hospitalario</p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-[11px] text-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse inline-block" />
          En tiempo real
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <LoadingSpinner /> Cargando datos...
        </div>
      )}

      {/* Errors */}
      {isForbidden && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 font-medium mb-6">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="9" cy="9" r="7" /><path d="M9 5v5" /><circle cx="9" cy="13" r="0.8" fill="currentColor" />
          </svg>
          Acceso denegado
        </div>
      )}
      {!isForbidden && error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-6">{error}</div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <MetricCard
          icon={iconPatient} iconBg="#E6F1FB" iconColor="#185FA5"
          label="Total pacientes" value={stats.totalPatients} sub="registrados en sistema"
        />
        <MetricCard
          icon={iconStudy} iconBg="#E1F5EE" iconColor="#0F6E56"
          label="Total estudios" value={stats.totalStudies} sub="procesados en total"
        />
        <MetricCard
          icon={iconChart} iconBg="#EEEDFE" iconColor="#534AB7"
          label="Tipos de estudio" value={types.length} sub="categorías activas"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        {/* Lista con barras */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900">Estudios por tipo</div>
            <div className="text-[11px] text-gray-400">distribución relativa</div>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {types.length === 0 ? (
              <span className="text-sm text-gray-400">Sin datos</span>
            ) : types.map((s, i) => {
              const count = s.count || s['count'] || 0;
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={s.type} className="flex items-center gap-3 py-2.5">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{s.type}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-800 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfica */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900">Volumen por tipo</div>
            <div className="text-[11px] text-gray-400">gráfica de barras</div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={types} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #D3D1C7', background: '#fff' }}
                  cursor={{ fill: 'rgba(136,135,128,0.07)' }}
                  formatter={(v) => [`${v} estudios`, 'Cantidad']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {types.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 mt-3">
            {types.map((s, i) => (
              <span key={s.type} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                {s.type}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
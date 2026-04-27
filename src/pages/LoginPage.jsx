import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useToast from '../hooks/useToast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const { toast, showToast, closeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      setToken(res.data.token);
      setUser(res.data.user);
      showToast('¡Bienvenido!', 'success');
      console.log('Rol recibido:', res.data.user.role);
      setTimeout(() => {
        if (res.data.user.role === 'ADMIN' || res.data.user.role === 'DIRECTOR') {
          console.log('Redirigiendo a /dashboard');
          navigate('/dashboard');
        } else if (res.data.user.role === 'MEDICO') {
          console.log('Redirigiendo a /patients');
          navigate('/patients');
        } else if (res.data.user.role === 'LABORATORIO') {
          console.log('Redirigiendo a /lab');
          navigate('/lab');
        } else {
          console.log('Redirigiendo a /dashboard (default)');
          navigate('/dashboard');
        }
      }, 800);
    } catch (err) {
      showToast(err.response?.data?.message || 'Credenciales incorrectas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { label: 'Admin', color: '#378ADD' },
    { label: 'Médico', color: '#1D9E75' },
    { label: 'Laboratorio', color: '#D4537E' },
    { label: 'Director', color: '#BA7517' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 32px 0 rgba(12,68,124,0.10)' }}>

        {/* Panel izquierdo */}
        <div className="hidden md:flex flex-col justify-between w-[52%] p-10 relative overflow-hidden" style={{ background: '#0C447C' }}>
          <div className="absolute rounded-full opacity-40" style={{ width: 220, height: 220, background: '#185FA5', top: -60, right: -60 }} />
          <div className="absolute rounded-full opacity-50" style={{ width: 180, height: 180, background: '#042C53', bottom: -80, left: -40 }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-8" style={{ background: '#185FA5' }}>
              <div className="rounded-full" style={{ width: 7, height: 7, background: '#B5D4F4' }} />
              <span className="tracking-wider" style={{ fontSize: 11, color: '#B5D4F4' }}>Sistema activo</span>
            </div>
            <h2 className="font-medium leading-snug mb-4" style={{ fontSize: 24, color: '#E6F1FB' }}>
              Plataforma de gestión hospitalaria
            </h2>
            <p className="leading-relaxed" style={{ fontSize: 13, color: '#85B7EB' }}>
              Acceso centralizado para médicos, laboratorio y administración. Información clínica segura en tiempo real.
            </p>
          </div>

          <div className="relative z-10 flex gap-8 mt-8">
            {[['4', 'Roles de acceso'], ['24/7', 'Disponibilidad'], ['SSL', 'Cifrado seguro']].map(([num, label]) => (
              <div key={label} className="pt-3" style={{ borderTop: '1px solid #185FA5' }}>
                <div className="font-medium" style={{ fontSize: 20, color: '#E6F1FB' }}>{num}</div>
                <div className="mt-0.5" style={{ fontSize: 11, color: '#85B7EB' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col justify-center w-full md:w-[48%] bg-white px-8 py-10">
          <div className="mb-7">
            <h3 className="font-medium text-gray-900 mb-1" style={{ fontSize: 18 }}>Bienvenido de nuevo</h3>
            <p className="text-gray-400" style={{ fontSize: 13 }}>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="flex items-center gap-1.5 font-medium text-gray-500 mb-1.5" style={{ fontSize: 12 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                </svg>
                Usuario
              </label>
              <input
                type="text"
                className="w-full px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition"
                style={{ height: 42, fontSize: 14 }}
                placeholder="Nombre de usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="flex items-center gap-1.5 font-medium text-gray-500 mb-1.5" style={{ fontSize: 12 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 016 0v2" />
                </svg>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition"
                  style={{ height: 42, fontSize: 14 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                      <line x1="2" y1="2" x2="14" y2="14" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg font-medium transition active:scale-[0.98] disabled:opacity-50"
              style={{ height: 44, fontSize: 14, background: '#0C447C', color: '#E6F1FB' }}
              onMouseEnter={e => e.currentTarget.style.background = '#185FA5'}
              onMouseLeave={e => e.currentTarget.style.background = '#0C447C'}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  Iniciar sesión
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 7h10M7 2l5 5-5 5" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-5">
            <hr className="flex-1 border-gray-100" />
            <span className="text-gray-300" style={{ fontSize: 11 }}>acceso por rol</span>
            <hr className="flex-1 border-gray-100" />
          </div>

          {/* Badges de roles */}
          <div className="flex flex-wrap gap-2">
            {roles.map(({ label, color }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-100 rounded-full text-gray-500"
                style={{ fontSize: 11 }}
              >
                <span className="rounded-full inline-block" style={{ width: 6, height: 6, background: color }} />
                {label}
              </span>
            ))}
          </div>

          <p className="text-center text-gray-300 mt-6" style={{ fontSize: 11 }}>
            &copy; {new Date().getFullYear()} Hospital Moderno · TeleSalud
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default LoginPage;
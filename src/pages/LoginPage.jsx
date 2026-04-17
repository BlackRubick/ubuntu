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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center w-28 h-28 border-4 border-blue-100">
          {/* Icono hospital SVG */}
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="14" rx="2" />
            <path d="M16 3v4" />
            <path d="M8 3v4" />
            <path d="M12 11v4" />
            <path d="M10 13h4" />
            <path d="M3 17h18" />
          </svg>
        </div>
        <div className="bg-white pt-20 pb-10 px-8 rounded-2xl shadow-2xl border border-blue-100">
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700 text-center tracking-tight">TeleSalud</h1>
          <p className="text-center text-gray-500 mb-8">Acceso al sistema hospitalario</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Usuario</label>
              <input type="text" className="w-full px-4 py-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 transition" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contraseña</label>
              <input type="password" className="w-full px-4 py-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 transition" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-bold text-lg shadow hover:bg-blue-800 transition disabled:opacity-60" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Entrar'}
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} Hospital Moderno</div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </div>
    </div>
  );
};

export default LoginPage;

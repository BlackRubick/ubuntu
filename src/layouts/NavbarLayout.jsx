import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
const NavbarLayout = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const links = [
    { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'DIRECTOR'] },
    { to: '/patients', label: 'Pacientes', roles: ['ADMIN', 'DIRECTOR', 'MEDICO'] },
    { to: '/consultas/nueva', label: 'Nueva consulta', roles: ['MEDICO'] },
    { to: '/lab', label: 'Laboratorio', roles: ['ADMIN', 'DIRECTOR', 'MEDICO', 'LABORATORIO'] },
    { to: '/results', label: 'Resultados', roles: ['ADMIN', 'DIRECTOR', 'MEDICO', 'LABORATORIO'] },
    { to: '/import-export', label: 'Exportar', roles: ['ADMIN', 'MEDICO'] },
    { to: '/users', label: 'Usuarios', roles: ['ADMIN'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(role));

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };


  // Estado para menú hamburguesa
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          {/* LEFT */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Botón hamburguesa en móvil */}
            <button
              className="sm:hidden mr-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {/* BRAND */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                   style={{ background: '#0C447C' }}>
                H
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium text-gray-900">MaxPau </div>
                <div className="text-[10px] text-gray-400 -mt-0.5">TeleSalud</div>
              </div>
            </div>
            {/* NAV LINKS (desktop) */}
            <div className="hidden sm:flex gap-1 overflow-x-auto no-scrollbar">
              {filteredLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${isActive
                      ? 'bg-[#E6F1FB] text-[#0C447C]'
                      : 'text-gray-600 hover:bg-gray-100'}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* USER */}
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                {getInitials(user?.name)}
              </div>
              {/* Info */}
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-medium text-gray-900">
                  {user?.name || 'Usuario'}
                </div>
                <div className="text-[10px] text-gray-400">
                  {role}
                </div>
              </div>
            </div>
            {/* LOGOUT */}
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="h-8 px-3 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              Salir
            </button>
          </div>
        </div>
        {/* Menú hamburguesa (móvil) */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
            {/* Drawer cubre 100% pantalla, fondo blanco sólido */}
            <div
              className="absolute inset-0 w-full h-full bg-white flex flex-col px-6 py-6 gap-4 animate-slide-in overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Botón cerrar fijo */}
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
              {/* Brand */}
              <div className="flex items-center gap-3 mb-2 mt-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base font-bold" style={{ background: '#0C447C' }}>H</div>
                <div>
                  <div className="text-base font-semibold text-gray-900">MaxPau</div>
                  <div className="text-xs text-gray-400 -mt-0.5">TeleSalud</div>
                </div>
              </div>
              {/* Links */}
              <nav className="flex flex-col gap-2 mt-2">
                {filteredLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-xl text-base font-medium transition-all tracking-wide
                      ${isActive
                        ? 'bg-[#E6F1FB] text-[#0C447C] shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'}`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              {/* Usuario y salir */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); useAuthStore.getState().logout(); }}
                  className="w-full h-10 px-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition font-medium"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* MAIN */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default NavbarLayout;
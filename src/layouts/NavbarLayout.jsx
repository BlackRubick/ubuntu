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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">

        <div className="flex items-center justify-between h-14 px-6">

          {/* LEFT */}
          <div className="flex items-center gap-6 min-w-0">

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

            {/* NAV LINKS */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">

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
      </nav>

      {/* MAIN */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default NavbarLayout;
import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const SidebarLayout = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const links = [
    { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'DIRECTOR'] },
    { to: '/patients', label: 'Pacientes', roles: ['ADMIN', 'DIRECTOR', 'MEDICO'] },
    { to: '/consultas/nueva', label: 'Nueva consulta', roles: ['MEDICO'] },
    { to: '/lab', label: 'Laboratorio', roles: ['ADMIN', 'DIRECTOR', 'MEDICO', 'LABORATORIO'] },
    { to: '/results', label: 'Resultados', roles: ['ADMIN', 'DIRECTOR', 'MEDICO', 'LABORATORIO'] },
    { to: '/import-export', label: 'Importar/Exportar', roles: ['ADMIN', 'MEDICO'] },
    { to: '/users', label: 'Usuarios', roles: ['ADMIN'] },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">

        {/* HEADER */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <div>
            <div className="text-sm font-medium text-gray-900">Hospital UP</div>
            <div className="text-[11px] text-gray-400 -mt-0.5">Chiapas</div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-3 space-y-1">

          {links
            .filter(link => link.roles.includes(role))
            .map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 h-9 rounded-lg text-sm transition
                  ${isActive
                    ? 'bg-[#E6F1FB] text-[#0C447C] font-medium'
                    : 'text-gray-600 hover:bg-gray-100'}`
                }
              >
                {/* Indicador visual */}
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {link.label}
              </NavLink>
            ))}

        </nav>

        {/* USER + LOGOUT */}
        <div className="p-3 border-t border-gray-100">

          {/* Usuario */}
          <div className="mb-3 px-2">
            <div className="text-xs text-gray-400">Sesión activa</div>
            <div className="text-sm text-gray-900 font-medium truncate">
              {user?.name || 'Usuario'}
            </div>
            <div className="text-[11px] text-gray-400">{role}</div>
          </div>

          {/* Logout */}
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="w-full h-9 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
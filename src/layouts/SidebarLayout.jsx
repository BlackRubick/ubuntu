

import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const SidebarLayout = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  // Definir las vistas permitidas por rol
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
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="h-20 flex items-center justify-center border-b">
          <span className="text-xl font-bold text-blue-700">Hospital UP Chiapas</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.filter(link => link.roles.includes(role)).map(link => (
            <NavLink key={link.to} to={link.to} className={({isActive}) => isActive ? 'block p-2 rounded bg-blue-100 text-blue-700 font-semibold' : 'block p-2 rounded hover:bg-blue-50'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="w-full bg-red-100 text-red-700 font-semibold py-2 rounded hover:bg-red-200 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;

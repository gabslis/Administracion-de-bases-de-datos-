import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuario?.cod_rol === 1 || usuario?.cod_rol === 4;
  const isAdmin = usuario?.cod_rol === 1;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>Préstamos Tech</h2>
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-text">Dashboard</span>
          </NavLink>
          
          {isAdmin && (
            <NavLink 
              to="/usuarios" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">👥</span>
              <span className="sidebar-text">Usuarios</span>
            </NavLink>
          )}

          {isAdminOrTecnico && (
            <NavLink 
              to="/equipos" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">💻</span>
              <span className="sidebar-text">Inventario</span>
            </NavLink>
          )}

          <NavLink 
            to="/ubicaciones" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🏫</span>
            <span className="sidebar-text">Ubicaciones</span>
          </NavLink>

          {isAdminOrTecnico && (
            <NavLink 
              to="/prestamos" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">📦</span>
              <span className="sidebar-text">Asignaciones</span>
            </NavLink>
          )}

          <NavLink 
            to="/mantenimientos" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🔧</span>
            <span className="sidebar-text">Mantenimientos</span>
          </NavLink>

          <NavLink 
            to="/incidencias" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🚨</span>
            <span className="sidebar-text">Incidencias</span>
          </NavLink>

          <NavLink 
            to="/sanciones" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">⚖️</span>
            <span className="sidebar-text">Sanciones</span>
          </NavLink>

          {isAdmin && (
            <NavLink 
              to="/configuracion" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">⚙️</span>
              <span className="sidebar-text">Ajustes</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="sidebar-link" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
          >
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;

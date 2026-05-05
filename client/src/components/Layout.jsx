import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuario?.cod_rol === 1 || usuario?.cod_rol === 4;

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
          
          {isAdminOrTecnico && (
            <NavLink 
              to="/usuarios" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">👥</span>
              <span className="sidebar-text">Usuarios</span>
            </NavLink>
          )}

          <NavLink 
            to="/prestamos" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📦</span>
            <span className="sidebar-text">Asignaciones</span>
          </NavLink>
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

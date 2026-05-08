import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  MapPin, 
  Package, 
  Wrench, 
  AlertTriangle, 
  Gavel, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Bell
} from 'lucide-react';

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuario?.cod_rol === 1 || usuario?.cod_rol === 4;
  const isAdmin = usuario?.cod_rol === 1;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard', roles: 'all' },
    { to: '/usuarios', icon: Users, text: 'Usuarios', roles: 'admin' },
    { to: '/equipos', icon: Monitor, text: 'Inventario', roles: 'staff' },
    { to: '/ubicaciones', icon: MapPin, text: 'Ubicaciones', roles: 'all' },
    { to: '/prestamos', icon: Package, text: 'Asignaciones', roles: 'staff' },
    { to: '/mantenimientos', icon: Wrench, text: 'Mantenimientos', roles: 'all' },
    { to: '/incidencias', icon: AlertTriangle, text: 'Incidencias', roles: 'all' },
    { to: '/sanciones', icon: Gavel, text: 'Sanciones', roles: 'all' },
    { to: '/configuracion', icon: Settings, text: 'Ajustes', roles: 'admin' },
  ];

  const filteredItems = navItems.filter(item => {
    if (item.roles === 'all') return true;
    if (item.roles === 'admin') return isAdmin;
    if (item.roles === 'staff') return isAdminOrTecnico;
    return false;
  });

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
              zIndex: 100, backdropFilter: 'blur(4px)' 
            }}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{
        width: collapsed ? '80px' : '260px',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 110,
        position: mobileOpen ? 'fixed' : 'sticky',
        left: mobileOpen ? 0 : (window.innerWidth < 768 ? '-260px' : 0),
        height: '100vh',
        top: 0
      }}>
        <div style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
          minHeight: '80px'
        }}>
          {!collapsed && (
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800, margin: 0 }}
            >
              TECH<span style={{ color: 'var(--text-h)' }}>FLOW</span>
            </motion.h2>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="toggle-btn"
            style={{ 
              background: 'var(--bg)', border: 'none', padding: '0.5rem', 
              borderRadius: '8px', cursor: 'pointer', color: 'var(--text-h)',
              display: window.innerWidth < 768 ? 'none' : 'flex'
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {filteredItems.map((item) => (
            <NavLink 
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.text : ''}
              style={{ marginBottom: '0.25rem' }}
            >
              <item.icon size={20} style={{ minWidth: '20px' }} />
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ fontSize: '0.95rem' }}
                >
                  {item.text}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLogout}
            className="sidebar-link"
            style={{ 
              width: '100%', background: 'transparent', border: 'none', 
              color: 'var(--danger)', cursor: 'pointer', padding: '0.75rem' 
            }}
          >
            <LogOut size={20} style={{ minWidth: '20px' }} />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* HEADER */}
        <header style={{ 
          height: '80px', 
          backgroundColor: 'var(--surface-glass)', 
          backdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              style={{ 
                display: window.innerWidth < 768 ? 'flex' : 'none',
                background: 'none', border: 'none', color: 'var(--text-h)'
              }}
            >
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>
              {navItems.find(i => i.to === location.pathname)?.text || 'Panel'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ 
                position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', 
                background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--surface)' 
              }} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'right', display: window.innerWidth < 640 ? 'none' : 'block' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)' }}>{usuario?.nombre}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)', opacity: 0.8 }}>
                  {isAdmin ? 'Administrador' : isAdminOrTecnico ? 'Técnico' : 'Docente'}
                </p>
              </div>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', 
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

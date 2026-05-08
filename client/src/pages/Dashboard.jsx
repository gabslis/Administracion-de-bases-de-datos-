import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Users, 
  Package, 
  Wrench, 
  AlertTriangle, 
  Gavel, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Plus,
  Search
} from 'lucide-react';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuario?.cod_rol === 1 || usuario?.cod_rol === 4;
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    equipos: 0,
    usuarios: 0,
    prestamos: 0,
    mantenimientosActivos: 0,
    incidencias: 0,
    sancionesActivas: 0,
  });
  
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true);
      try {
        const [equipos, usuarios, prestamos, mantenimientos, incidencias, sanciones] = await Promise.all([
          api.get('/equipos'),
          api.get('/usuarios'),
          api.get('/prestamos'),
          api.get('/mantenimientos'),
          api.get('/incidencias'),
          api.get('/sanciones'),
        ]);
        
        let prestamosList = prestamos.data;
        let mantenimientosList = mantenimientos.data;

        if (!isAdminOrTecnico) {
          prestamosList = prestamosList.filter(p => p.cod_usuario === usuario?.cod_usuario);
          mantenimientosList = mantenimientosList.filter(m => m.cod_usuario === usuario?.cod_usuario);
        }

        setStats({
          equipos: equipos.data.length,
          usuarios: usuarios.data.length,
          prestamos: prestamosList.length,
          mantenimientosActivos: mantenimientosList.filter(m => m.cod_estado_mantenimiento === 1 || m.cod_estado_mantenimiento === 2).length,
          incidencias: incidencias.data.length,
          sancionesActivas: sanciones.data.length,
        });

        const ultimosMantenimientos = [...mantenimientosList]
          .sort((a, b) => b.cod_mantenimiento - a.cod_mantenimiento)
          .slice(0, 5);
        
        setActividadReciente(ultimosMantenimientos);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    if (usuario) fetchDatos();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, index }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="premium-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        borderLeft: `4px solid ${color}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: '12px', 
          backgroundColor: `${color}15`, 
          color: color 
        }}>
          <Icon size={24} />
        </div>
        <TrendingUp size={16} style={{ color: 'var(--success)', opacity: 0.8 }} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.875rem', fontWeight: 800, margin: 0, color: 'var(--text-h)' }}>
          {isLoading ? '...' : value}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
          {title}
        </p>
      </div>
    </motion.div>
  );

  const renderEstadoBadge = (cod_estado) => {
    const configs = {
      1: { label: 'Pendiente', color: 'var(--warning)' },
      2: { label: 'En Proceso', color: 'var(--primary)' },
      3: { label: 'Completado', color: 'var(--success)' }
    };
    const config = configs[cod_estado] || { label: 'Desconocido', color: 'var(--secondary)' };
    return (
      <span style={{ 
        backgroundColor: `${config.color}15`, 
        color: config.color, 
        padding: '0.35rem 0.75rem', 
        borderRadius: '2rem', 
        fontSize: '0.75rem', 
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Hola, {usuario?.nombre.split(' ')[0]} 👋
            </h2>
            <p style={{ color: 'var(--text)', fontSize: '1rem' }}>
              Aquí tienes un resumen de lo que está sucediendo hoy.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="premium-btn premium-btn-ghost" style={{ padding: '0.6rem 1rem' }}>
               <Clock size={18} /> Historial
             </button>
             <button className="premium-btn premium-btn-primary" onClick={() => navigate('/mantenimientos')}>
               <Plus size={18} /> Nuevo Ticket
             </button>
          </div>
        </div>
      </header>
      
      {/* Quick Actions for Admins */}
      {isAdminOrTecnico && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button className="quick-action-btn" onClick={() => navigate('/prestamos')}>
              <Package size={18} /> Asignar Equipo
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/usuarios')}>
              <Users size={18} /> Gestionar Usuarios
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/equipos')}>
              <Monitor size={18} /> Ver Inventario
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/incidencias')}>
              <AlertTriangle size={18} /> Reportar Falla
            </button>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {isAdminOrTecnico ? (
          <>
            <StatCard index={0} title="Equipos Totales" value={stats.equipos} icon={Monitor} color="#6366f1" />
            <StatCard index={1} title="Usuarios" value={stats.usuarios} icon={Users} color="#10b981" />
            <StatCard index={2} title="Incidencias" value={stats.incidencias} icon={AlertTriangle} color="#f59e0b" />
            <StatCard index={3} title="Sanciones" value={stats.sancionesActivas} icon={Gavel} color="#ef4444" />
          </>
        ) : (
          <>
            <StatCard index={0} title="Mis Equipos" value={stats.prestamos} icon={Package} color="#6366f1" />
            <StatCard index={1} title="Tickets Activos" value={stats.mantenimientosActivos} icon={Wrench} color="#f59e0b" />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="premium-card" style={{ padding: 0, marginTop: '2.5rem' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0 }}>Mantenimientos Recientes</h3>
          </div>
          <button onClick={() => navigate('/mantenimientos')} className="premium-btn premium-btn-ghost" style={{ fontSize: '0.875rem' }}>
            Ver todos <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Equipo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}><div className="skeleton" style={{ height: '2.5rem', margin: '0.5rem 0' }}></div></td>
                  </tr>
                ))
              ) : actividadReciente.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                    No hay actividad reciente para mostrar.
                  </td>
                </tr>
              ) : (
                actividadReciente.map((m, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={m.cod_mantenimiento}
                  >
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>#{m.cod_mantenimiento}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{m.nombre_equipo}</td>
                    <td style={{ maxWidth: '300px', color: 'var(--text)' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.descripcion_problema}
                      </div>
                    </td>
                    <td>{renderEstadoBadge(m.cod_estado_mantenimiento)}</td>
                    <td style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                      {new Date(m.fecha_inicio_mantenimiento).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
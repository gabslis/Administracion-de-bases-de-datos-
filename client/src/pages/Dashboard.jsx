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
  Search,
  History
} from 'lucide-react';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isTecnico = userRole === 4;
  const isAdmin = userRole === 1;
  const isDocenteOrDirector = userRole === 2 || userRole === 3;
  const isAdminOrTecnico = isTecnico || isAdmin;

  
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
        // Ejecutamos peticiones en paralelo pero con catch individual para que una falla no rompa todo
        const safeFetch = async (url) => {
          try {
            const res = await api.get(url);
            return res.data;
          } catch (e) {
            console.warn(`Error cargando ${url}:`, e.message);
            return [];
          }
        };

        const [
          equiposData, 
          usuariosData, 
          prestamosData, 
          mantenimientosData, 
          incidenciasData, 
          sancionesData
        ] = await Promise.all([
          isAdminOrTecnico ? safeFetch('/equipos') : Promise.resolve([]),
          isAdmin ? safeFetch('/usuarios') : Promise.resolve([]),
          safeFetch('/prestamos'),
          safeFetch('/mantenimientos'),
          safeFetch('/incidencias'),
          safeFetch('/sanciones'),
        ]);

        setStats({
          equipos: equiposData.length,
          usuarios: usuariosData.length,
          prestamos: prestamosData.length,
          mantenimientosActivos: mantenimientosData.filter(m => m.cod_estado_mantenimiento === 1 || m.cod_estado_mantenimiento === 2).length,
          incidencias: incidenciasData.length,
          sancionesActivas: sancionesData.length,
        });

        // Actividad reciente: tomamos los últimos mantenimientos o préstamos
        const combinada = [...mantenimientosData]
          .sort((a, b) => b.cod_mantenimiento - a.cod_mantenimiento)
          .slice(0, 5);
        
        setActividadReciente(combinada);
      } catch (err) {
        console.error("Error crítico en Dashboard:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    if (usuarioActual) fetchDatos();
  }, []);


  const StatCard = ({ title, value, icon: Icon, color, index, onClick }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="premium-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        borderLeft: `4px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      whileHover={onClick ? { y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } : {}}
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
      1: { label: 'Pendiente', color: '#f59e0b' },
      2: { label: 'En Proceso', color: '#6366f1' },
      3: { label: 'Completado', color: '#10b981' }
    };
    const config = configs[cod_estado] || { label: 'Desconocido', color: '#6b7280' };
    return (
      <span style={{ 
        backgroundColor: `${config.color}15`, 
        color: config.color, 
        padding: '0.35rem 0.75rem', 
        borderRadius: '2rem', 
        fontSize: '0.75rem', 
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              Hola, {usuarioActual?.nombre?.split(' ')[0] || 'Usuario'} 👋
            </h2>

            <p style={{ color: 'var(--text)', fontSize: '1rem', marginTop: '0.5rem' }}>
              Aquí tienes un resumen de la actividad del sistema.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="premium-btn premium-btn-ghost" onClick={() => navigate('/prestamos')}>
               <History size={18} /> Historial
             </button>
             <button className="premium-btn premium-btn-primary" onClick={() => navigate('/mantenimientos')}>
               <Plus size={18} /> Nuevo Ticket
             </button>
          </div>
        </div>
      </header>
      
      {/* Quick Actions */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {isAdminOrTecnico && (
            <>
              <button className="quick-action-btn" onClick={() => navigate('/prestamos')}>
                <Package size={18} /> Asignar Equipo
              </button>
              {isAdmin && (
                <button className="quick-action-btn" onClick={() => navigate('/usuarios')}>
                  <Users size={18} /> Gestionar Usuarios
                </button>
              )}
              <button className="quick-action-btn" onClick={() => navigate('/equipos')}>
                <Monitor size={18} /> Ver Inventario
              </button>
            </>
          )}
          <button className="quick-action-btn" onClick={() => navigate('/incidencias')}>
            <AlertTriangle size={18} /> Reportar Falla
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="stats-grid">
        {isAdminOrTecnico ? (
          <>
            <StatCard index={0} title="Equipos Totales" value={stats.equipos} icon={Monitor} color="#6366f1" onClick={() => navigate('/equipos')} />
            {isAdmin ? (
              <StatCard index={1} title="Usuarios Registrados" value={stats.usuarios} icon={Users} color="#10b981" onClick={() => navigate('/usuarios')} />
            ) : (
              <StatCard index={1} title="Préstamos Totales" value={stats.prestamos} icon={Package} color="#10b981" onClick={() => navigate('/prestamos')} />
            )}
            <StatCard index={2} title="Incidencias" value={stats.incidencias} icon={AlertTriangle} color="#f59e0b" onClick={() => navigate('/incidencias')} />
            <StatCard index={3} title="Sanciones" value={stats.sancionesActivas} icon={Gavel} color="#ef4444" onClick={() => navigate('/sanciones')} />
          </>
        ) : (
          <>
            <StatCard index={0} title="Mis Préstamos" value={stats.prestamos} icon={Package} color="#6366f1" onClick={() => navigate('/prestamos')} />
            <StatCard index={1} title="Mis Tickets" value={stats.mantenimientosActivos} icon={Wrench} color="#f59e0b" onClick={() => navigate('/mantenimientos')} />
            <StatCard index={2} title="Mis Sanciones" value={stats.sancionesActivas} icon={Gavel} color="#ef4444" onClick={() => navigate('/sanciones')} />
            <StatCard index={3} title="Mis Incidencias" value={stats.incidencias} icon={AlertTriangle} color="#f59e0b" onClick={() => navigate('/incidencias')} />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="premium-card" style={{ padding: 0, marginTop: '2.5rem' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Mantenimientos Recientes</h3>
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
                    No hay actividad reciente registrada.
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
                    <td style={{ fontWeight: 600 }}>{m.nombre_equipo}</td>
                    <td style={{ maxWidth: '300px', color: 'var(--text)' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.descripcion_problema || "Sin descripción"}
                      </div>
                    </td>
                    <td>{renderEstadoBadge(m.cod_estado_mantenimiento)}</td>
                    <td style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                      {new Date(m.fecha_inicio_mantenimiento).toLocaleDateString()}
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
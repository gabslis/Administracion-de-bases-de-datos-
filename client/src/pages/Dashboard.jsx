import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

        // Si no es Admin o Técnico, filtrar por su ID de usuario
        if (!isAdminOrTecnico) {
          prestamosList = prestamosList.filter(p => p.cod_usuario === usuario?.cod_usuario);
          mantenimientosList = mantenimientosList.filter(m => m.cod_usuario === usuario?.cod_usuario);
        }

        setStats({
          equipos: equipos.data.length,
          usuarios: usuarios.data.length,
          prestamos: prestamosList.length,
          // Solo contar los tickets Pendientes(1) y En Proceso(2)
          mantenimientosActivos: mantenimientosList.filter(m => m.cod_estado_mantenimiento === 1 || m.cod_estado_mantenimiento === 2).length,
          incidencias: incidencias.data.length,
          sancionesActivas: sanciones.data.length,
        });

        // Configurar actividad reciente (últimos 5 mantenimientos)
        const ultimosMantenimientos = [...mantenimientosList]
          .sort((a, b) => b.cod_mantenimiento - a.cod_mantenimiento)
          .slice(0, 5);
        
        setActividadReciente(ultimosMantenimientos);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    if (usuario) fetchDatos();
  }, []);

  const StatCard = ({ title, value, colorClass, icon }) => (
    <div className="premium-card" style={{ textAlign: 'center', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isLoading ? (
        <>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
        </>
      ) : (
        <>
          <h1 style={{ color: `var(--${colorClass})`, margin: '0 0 0.5rem 0', fontSize: '3rem' }}>{value}</h1>
          <p style={{ color: 'var(--text)', fontWeight: 500 }}>{icon} {title}</p>
        </>
      )}
    </div>
  );

  const renderEstadoBadge = (cod_estado) => {
    switch(cod_estado) {
      case 1: return <span style={{ background: 'var(--warning)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Pendiente</span>;
      case 2: return <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>En Proceso</span>;
      case 3: return <span style={{ background: 'var(--success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Completado</span>;
      default: return <span style={{ background: 'gray', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Desconocido</span>;
    }
  };

  return (
    <div>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Bienvenido, {usuario?.nombre} 👋
        </h3>
        
        {/* Acciones Rápidas */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {isAdminOrTecnico ? (
            <>
              <button className="quick-action-btn" onClick={() => navigate('/prestamos')}>
                📦 Asignar Equipo
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/usuarios')}>
                👥 Nuevo Usuario
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/mantenimientos')}>
                🔧 Ver Tickets
              </button>
            </>
          ) : (
            <>
              <button className="quick-action-btn" onClick={() => navigate('/prestamos')}>
                📦 Mis Equipos
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/mantenimientos')}>
                🔧 Solicitar Mantenimiento
              </button>
            </>
          )}
        </div>
        
        {/* Estadísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {isAdminOrTecnico && (
            <>
              <StatCard title="Total Equipos" value={stats.equipos} colorClass="primary" icon="💻" />
              <StatCard title="Total Usuarios" value={stats.usuarios} colorClass="success" icon="👥" />
              <StatCard title="Incidencias" value={stats.incidencias} colorClass="warning" icon="🚨" />
              <StatCard title="Sanciones Activas" value={stats.sancionesActivas} colorClass="danger" icon="⚖️" />
            </>
          )}
          
          <StatCard 
            title={isAdminOrTecnico ? 'Total Préstamos' : 'Mis Equipos Asignados'} 
            value={stats.prestamos} 
            colorClass="warning" 
            icon="📦" 
          />
          <StatCard 
            title={isAdminOrTecnico ? 'Mantenimientos Activos' : 'Mis Tickets Activos'} 
            value={stats.mantenimientosActivos} 
            colorClass="danger" 
            icon="🔧" 
          />
        </div>

        {/* Actividad Reciente */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Últimos Tickets de Mantenimiento</h3>
            <button onClick={() => navigate('/mantenimientos')} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
              Ver todos ➔
            </button>
          </div>
          
          {isLoading ? (
            <div style={{ padding: '1.5rem' }}>
              <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '10px' }}></div>
              <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '10px' }}></div>
              <div className="skeleton skeleton-text" style={{ height: '40px' }}></div>
            </div>
          ) : actividadReciente.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-h)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📭</span>
              No hay tickets de mantenimiento recientes.
            </p>
          ) : (
            <div className="table-responsive" style={{ margin: 0 }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Equipo</th>
                    <th>Falla Reportada</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {actividadReciente.map(m => (
                    <tr key={m.cod_mantenimiento}>
                      <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{m.cod_mantenimiento}</td>
                      <td>{m.nombre_equipo || 'Equipo no asignado'}</td>
                      <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-h)' }}>
                        {m.descripcion_problema || <span style={{fontStyle: 'italic'}}>Sin descripción</span>}
                      </td>
                      <td>{renderEstadoBadge(m.cod_estado_mantenimiento)}</td>
                      <td>
                        {new Date(m.fecha_inicio_mantenimiento).toLocaleDateString()}{' '}
                        {m.hora_recibida ? <span style={{fontSize: '0.8rem', color: 'gray'}}>{m.hora_recibida.slice(0,5)}</span> : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default Dashboard;
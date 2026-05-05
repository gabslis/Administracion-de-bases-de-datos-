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
    mantenimientos: 0,
  });
  
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true);
      try {
        const [equipos, usuarios, prestamos, mantenimientos] = await Promise.all([
          api.get('/equipos'),
          api.get('/usuarios'),
          api.get('/prestamos'),
          api.get('/mantenimientos'),
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
          mantenimientos: mantenimientosList.length,
        });

        // Configurar actividad reciente (últimos 5 mantenimientos)
        // Se asume que el backend devuelve los mantenimientos en orden o podemos ordenarlos por ID
        const ultimosMantenimientos = [...mantenimientosList]
          .sort((a, b) => b.cod_mantenimiento - a.cod_mantenimiento)
          .slice(0, 5);
        
        setActividadReciente(ultimosMantenimientos);
      } catch (err) {
        console.error(err);
      } finally {
        // Simulamos un pequeño retardo para que la animación de carga se aprecie suavemente
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    if (usuario) fetchDatos();
  }, []); // Dependencias vacías para que solo se ejecute al montar el componente

  // Componente interno para las tarjetas de estadísticas
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
            </>
          )}
          
          <StatCard 
            title={isAdminOrTecnico ? 'Total Préstamos' : 'Mis Equipos Asignados'} 
            value={stats.prestamos} 
            colorClass="warning" 
            icon="📦" 
          />
          <StatCard 
            title={isAdminOrTecnico ? 'Total en Mantenimiento' : 'Mis Equipos en Mantenimiento'} 
            value={stats.mantenimientos} 
            colorClass="danger" 
            icon="🔧" 
          />
        </div>

        {/* Actividad Reciente */}
        <div className="premium-card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Últimos Mantenimientos</h3>
          </div>
          
          {isLoading ? (
            <div style={{ padding: '1rem 0' }}>
              <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '10px' }}></div>
              <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '10px' }}></div>
              <div className="skeleton skeleton-text" style={{ height: '40px' }}></div>
            </div>
          ) : actividadReciente.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
              No hay actividad reciente.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Estado</th>
                    <th>Fecha Inicio</th>
                  </tr>
                </thead>
                <tbody>
                  {actividadReciente.map(m => (
                    <tr key={m.cod_mantenimiento}>
                      <td>#{m.cod_mantenimiento}</td>
                      <td>
                        <span className={`status-badge ${
                          m.cod_estado_mantenimiento === 1 ? 'status-pending' :
                          m.cod_estado_mantenimiento === 2 ? 'status-active' :
                          'status-inactive'
                        }`}>
                          {m.cod_estado_mantenimiento === 1 ? 'Pendiente' :
                           m.cod_estado_mantenimiento === 2 ? 'En Proceso' : 'Completado'}
                        </span>
                      </td>
                      <td>{new Date(m.fecha_inicio_mantenimiento).toLocaleDateString()}</td>
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
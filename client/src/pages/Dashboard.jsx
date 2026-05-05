import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuario?.cod_rol === 1 || usuario?.cod_rol === 4;
  
  const [stats, setStats] = useState({
    equipos: 0,
    usuarios: 0,
    prestamos: 0,
    mantenimientos: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipos, usuarios, prestamos, mantenimientos] = await Promise.all([
          api.get('/equipos'),
          api.get('/usuarios'),
          api.get('/prestamos'),
          api.get('/mantenimientos'),
        ]);
        
        let prestamosCount = prestamos.data.length;
        let mantenimientosCount = mantenimientos.data.length;

        // Si no es Admin o Técnico, filtrar por su ID de usuario
        if (!isAdminOrTecnico) {
          prestamosCount = prestamos.data.filter(p => p.cod_usuario === usuario?.cod_usuario).length;
          mantenimientosCount = mantenimientos.data.filter(m => m.cod_usuario === usuario?.cod_usuario).length;
        }

        setStats({
          equipos: equipos.data.length,
          usuarios: usuarios.data.length,
          prestamos: prestamosCount,
          mantenimientos: mantenimientosCount,
        });
      } catch (err) {
        console.error(err);
      }
    };
    if (usuario) fetchStats();
  }, [isAdminOrTecnico, usuario]);

  return (
    <div>
      {/* CONTENIDO */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Bienvenido, {usuario?.nombre} 👋</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {isAdminOrTecnico && (
            <>
              <div className="premium-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <h1 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0', fontSize: '3rem' }}>{stats.equipos}</h1>
                <p style={{ color: 'var(--text)', fontWeight: 500 }}>💻 Total Equipos</p>
              </div>
              <div className="premium-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <h1 style={{ color: 'var(--success)', margin: '0 0 0.5rem 0', fontSize: '3rem' }}>{stats.usuarios}</h1>
                <p style={{ color: 'var(--text)', fontWeight: 500 }}>👥 Total Usuarios</p>
              </div>
            </>
          )}
          
          <div className="premium-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <h1 style={{ color: 'var(--warning)', margin: '0 0 0.5rem 0', fontSize: '3rem' }}>{stats.prestamos}</h1>
            <p style={{ color: 'var(--text)', fontWeight: 500 }}>
              {isAdminOrTecnico ? '📦 Total Préstamos' : '📦 Mis Equipos Asignados'}
            </p>
          </div>
          <div className="premium-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <h1 style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0', fontSize: '3rem' }}>{stats.mantenimientos}</h1>
            <p style={{ color: 'var(--text)', fontWeight: 500 }}>
              {isAdminOrTecnico ? '🔧 Total en Mantenimiento' : '🔧 Mis Equipos en Mantenimiento'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
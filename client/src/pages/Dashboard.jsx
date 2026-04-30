import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
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
        setStats({
          equipos: equipos.data.length,
          usuarios: usuarios.data.length,
          prestamos: prestamos.data.length,
          mantenimientos: mantenimientos.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* NAVBAR */}
      <div style={{ background: '#001529', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'white', margin: 0 }}>🖥️ Sistema de Préstamos</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'white' }}>👤 {usuario?.nombre}</span>
          <button onClick={() => navigate('/usuarios')} style={{ padding: '0.4rem 1rem', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Usuarios
          </button>
          <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: '2rem' }}>
        <h3>Bienvenido, {usuario?.nombre} 👋</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#1890ff', margin: 0 }}>{stats.equipos}</h1>
            <p>💻 Equipos</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#52c41a', margin: 0 }}>{stats.usuarios}</h1>
            <p>👥 Usuarios</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#faad14', margin: 0 }}>{stats.prestamos}</h1>
            <p>📦 Préstamos</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#ff4d4f', margin: 0 }}>{stats.mantenimientos}</h1>
            <p>🔧 Mantenimientos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
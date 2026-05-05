import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [codRol, setCodRol] = useState('');
  
  const [roles, setRoles] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) {
      // Fetch roles for registration
      api.get('/roles').then(res => {
        // Exclude Administrador (cod_rol === 1)
        const allowedRoles = res.data.filter(r => r.cod_rol !== 1);
        setRoles(allowedRoles);
        if (allowedRoles.length > 0) {
          setCodRol(allowedRoles[0].cod_rol);
        }
      }).catch(err => {
        console.error("Error al cargar roles:", err);
        toast.error("Error al cargar los roles del sistema");
      });
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // LOGIN
        const res = await api.post('/login', { correo, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        toast.success(`Bienvenido, ${res.data.usuario.nombre}`);
        navigate('/dashboard');
      } else {
        // REGISTRO
        const fecha_ingreso = new Date().toISOString().split('T')[0];
        
        await api.post('/usuarios', {
          nombre,
          correo,
          password,
          cod_rol: codRol,
          fecha_ingreso,
          cod_estado_usuario: 1
        });
        
        toast.success('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
        setIsLogin(true); // Switch back to login
        setPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ocurrió un error. Verifica tus datos.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'var(--bg)' 
    }}>
      <div className="premium-card" style={{ width: '400px', maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>🖥️ Préstamos Tech</h2>
          <p style={{ color: 'var(--text)' }}>
            {isLogin ? 'Ingresa tus credenciales para continuar' : 'Crea tu cuenta para acceder'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Nombre Completo</label>
              <input
                type="text"
                className="premium-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Correo Electrónico</label>
            <input
              type="email"
              className="premium-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Contraseña</label>
            <input
              type="password"
              className="premium-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Rol</label>
              <select 
                className="premium-input" 
                value={codRol} 
                onChange={(e) => setCodRol(e.target.value)}
                required={!isLogin}
              >
                {roles.map(r => (
                  <option key={r.cod_rol} value={r.cod_rol}>{r.nombre_rol}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="premium-btn premium-btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            type="button" 
            className="premium-btn premium-btn-ghost" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            style={{ width: '100%' }}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import api from '../api/axios';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [codRol, setCodRol] = useState('');
  
  const [roles, setRoles] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) {
      api.get('/auth/public-roles').then(res => {
        setRoles(res.data);
        if (res.data.length > 0) {
          setCodRol(res.data[0].cod_rol);
        }
      }).catch(err => {
        console.error("Error al cargar roles:", err);
        toast.error("Error al cargar los roles del sistema");
      });
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { correo, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        toast.success(`Bienvenido, ${res.data.usuario.nombre}`);
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', {
          nombre,
          correo,
          password,
          cod_rol: codRol
        });
        toast.success('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ocurrió un error. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{ 
        position: 'absolute', width: '500px', height: '500px', 
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        top: '-10%', right: '-10%', borderRadius: '50%' 
      }} />
      <div style={{ 
        position: 'absolute', width: '400px', height: '400px', 
        background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
        bottom: '-10%', left: '-5%', borderRadius: '50%' 
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          padding: '2.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            style={{ 
              display: 'inline-flex', padding: '1rem', borderRadius: '1.25rem', 
              background: 'var(--primary)', color: 'white', marginBottom: '1.25rem',
              boxShadow: '0 10px 15px -3px rgba(99,102,241,0.4)'
            }}
          >
            {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
          </motion.div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            {isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            {isLogin ? 'Ingresa tus credenciales para acceder al sistema' : 'Completa el formulario para registrarte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                className="premium-input"
                style={{ paddingLeft: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre Completo"
                required={!isLogin}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="email"
              className="premium-input"
              style={{ paddingLeft: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Correo Electrónico"
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="password"
              className="premium-input"
              style={{ paddingLeft: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <select 
                className="premium-input" 
                style={{ paddingLeft: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={codRol} 
                onChange={(e) => setCodRol(e.target.value)}
                required={!isLogin}
              >
                {roles.map(r => (
                  <option key={r.cod_rol} value={r.cod_rol} style={{ background: '#1e1b4b' }}>{r.nombre_rol}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="premium-btn premium-btn-primary" 
            style={{ marginTop: '0.5rem', width: '100%', height: '50px' }}
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            type="button" 
            className="premium-btn premium-btn-ghost" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ width: '100%', color: 'rgba(255,255,255,0.6)' }}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
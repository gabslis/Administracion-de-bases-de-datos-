import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Calendar, 
  Activity, 
  Edit, 
  Trash2, 
  Search,
  Lock,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../api/axios";

const vacio = { nombre: "", cod_rol: "", correo: "", password: "", fecha_ingreso: "", cod_estado_usuario: "1" };

function Usuarios() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isAdminOrTecnico = userRole === 1 || userRole === 4;
  const isAdmin = userRole === 1;



  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [estadosList, setEstadosList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const cargar = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch(err) {
      toast.error("Error al sincronizar lista de usuarios");
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [rolesRes, estadosRes] = await Promise.all([
        api.get("/usuarios/roles"),
        api.get("/usuarios/estados")
      ]);
      setRoles(rolesRes.data);
      setEstadosList(estadosRes.data);
    } catch (err) {
      console.error("Error cargando catálogos", err);
    }
  };

  useEffect(() => { 
    cargar(); 
    cargarCatalogos();
  }, []);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => 
      (u.nombre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.correo || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usuarios, searchQuery]);


  if (!isAdminOrTecnico) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ background: 'var(--danger-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--danger)' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Acceso Restringido</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>Solo administradores y técnicos pueden gestionar usuarios. Por favor, contacta con soporte si crees que esto es un error.</p>
        </motion.div>
      </div>
    );
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put("/usuarios/" + editId, form);
        toast.success("Perfil actualizado");
      } else {
        await api.post("/usuarios", form);
        toast.success("Usuario registrado");
      }
      setForm(vacio);
      setEditId(null);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      toast.error(err.response?.data?.error || "Error al procesar solicitud");
    }
  };

  const handleEditar = (u) => {
    setForm({ 
      nombre: u.nombre, 
      cod_rol: u.cod_rol, 
      correo: u.correo, 
      password: "", 
      fecha_ingreso: u.fecha_ingreso?.split("T")[0], 
      cod_estado_usuario: u.cod_estado_usuario 
    });
    setEditId(u.cod_usuario);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas eliminar permanentemente a este usuario?")) return;
    try {
      await api.delete("/usuarios/" + id);
      toast.success("Usuario eliminado");
      cargar();
    } catch {
      toast.error("Error: El usuario tiene registros vinculados");
    }
  };

  const getNombreRol = (cod) => roles.find(r => r.cod_rol === cod)?.nombre_rol || `Rol ${cod}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text)' }}>Administra el acceso y roles del personal institucional.</p>
        </div>
        <button onClick={() => { setForm(vacio); setEditId(null); setMostrarForm(!mostrarForm); }}
          className="premium-btn premium-btn-primary">
          {mostrarForm ? <X size={18} /> : <UserPlus size={18} />}
          {mostrarForm ? 'Cancelar' : 'Agregar Usuario'}
        </button>
      </header>

      <AnimatePresence>
        {mostrarForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div className="premium-card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={20} /> {editId ? "Modificar Perfil" : "Nuevo Registro de Usuario"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo</label>
                  <input className="premium-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Juan Pérez" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Correo Institucional</label>
                  <input className="premium-input" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} placeholder="usuario@dominio.com" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    Contraseña {editId && <span style={{ fontWeight: 400, opacity: 0.7 }}>(Opcional)</span>}
                  </label>
                  <input className="premium-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editId ? "Dejar en blanco para mantener" : "********"} required={!editId} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Rol del Sistema</label>
                  <select className="premium-input" value={form.cod_rol} onChange={e => setForm({...form, cod_rol: e.target.value})} required>
                    <option value="">Seleccione un nivel...</option>
                    {roles.map(r => <option key={r.cod_rol} value={r.cod_rol}>{r.nombre_rol}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Fecha de Contratación / Ingreso</label>
                  <input className="premium-input" type="date" value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Estado de Cuenta</label>
                  <select className="premium-input" value={form.cod_estado_usuario} onChange={e => setForm({...form, cod_estado_usuario: e.target.value})} required>
                    {estadosList.map(es => <option key={es.cod_estado_usuario} value={es.cod_estado_usuario}>{es.tipo_estado_usuario}</option>)}
                  </select>
                </div>
                
                <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem" }}>
                  <button type="submit" className="premium-btn premium-btn-primary">
                    {editId ? "Guardar Cambios" : "Crear Usuario"}
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost">Descartar</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="premium-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)', opacity: 0.5 }} />
            <input type="text" placeholder="Filtrar por nombre o correo..." className="premium-input" style={{ paddingLeft: '3rem' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol / Permisos</th>
                <th>Ingreso</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((u, idx) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={u.cod_usuario}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: 'var(--primary-light)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem' }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-h)' }}>{u.nombre}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ID: #{u.cod_usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                      <Mail size={14} style={{ opacity: 0.5 }} />
                      {u.correo}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'var(--bg-sec)', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                      <Shield size={12} /> {getNombreRol(u.cod_rol)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} style={{ opacity: 0.5 }} />
                      {u.fecha_ingreso?.split("T")[0]}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: u.cod_estado_usuario === 1 ? 'var(--success-light)' : 'var(--danger-light)', 
                      color: u.cod_estado_usuario === 1 ? 'var(--success)' : 'var(--danger)' 
                    }}>
                      {u.cod_estado_usuario === 1 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {u.cod_estado_usuario === 1 ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEditar(u)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleEliminar(u.cod_usuario)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsuarios.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
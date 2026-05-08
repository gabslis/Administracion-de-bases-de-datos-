import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const vacio = { nombre: "", cod_rol: "", correo: "", password: "", fecha_ingreso: "", cod_estado_usuario: "1" };

function Usuarios() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdmin = usuarioActual?.cod_rol === 1;

  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [estadosList, setEstadosList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch(err) {
      toast.error("Error al cargar la lista de usuarios");
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [rolesRes, estadosRes] = await Promise.all([
        api.get("/roles"),
        api.get("/estado_usuario")
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

  // Solo el Administrador puede gestionar usuarios
  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
        <h3>Acceso restringido</h3>
        <p style={{ color: 'var(--text-h)' }}>
          Solo los <strong>Administradores</strong> pueden gestionar usuarios del sistema.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put("/usuarios/" + editId, form);
        toast.success("Usuario actualizado correctamente");
      } else {
        await api.post("/usuarios", form);
        toast.success("Usuario creado correctamente");
      }
      setForm(vacio);
      setEditId(null);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      toast.error("Error: " + (err.response?.data?.error || err.message));
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
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await api.delete("/usuarios/" + id);
      toast.success("Usuario eliminado");
      cargar();
    } catch {
      toast.error("No se puede eliminar: tiene registros asociados");
    }
  };

  const getNombreRol = (cod) => roles.find(r => r.cod_rol === cod)?.nombre_rol || `Rol ${cod}`;

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>👥 Gestión de Usuarios</h2>
          <button onClick={() => { setForm(vacio); setEditId(null); setMostrarForm(!mostrarForm); }}
            className="premium-btn premium-btn-primary">
            + Agregar Usuario
          </button>
        </div>

        {mostrarForm && (
          <div className="premium-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1.5rem' }}>
              {editId ? "Editar usuario" : "Nuevo usuario"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Nombre Completo</label>
                <input className="premium-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Correo</label>
                <input className="premium-input" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Contraseña {editId && <span style={{ fontWeight: 400, color: 'var(--text-h)' }}>(vacío = no cambiar)</span>}
                </label>
                <input className="premium-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editId} />
              </div>
              <div>
                {/* Admin ve TODOS los roles en el selector */}
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Rol</label>
                <select className="premium-input" value={form.cod_rol} onChange={e => setForm({...form, cod_rol: e.target.value})} required>
                  <option value="">Seleccione un rol...</option>
                  {roles.map(r => (
                    <option key={r.cod_rol} value={r.cod_rol}>{r.nombre_rol}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha de ingreso</label>
                <input className="premium-input" type="date" value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Estado</label>
                <select className="premium-input" value={form.cod_estado_usuario} onChange={e => setForm({...form, cod_estado_usuario: e.target.value})} required>
                  {estadosList.map(es => (
                    <option key={es.cod_estado_usuario} value={es.cod_estado_usuario}>{es.tipo_estado_usuario}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                <button type="submit" className="premium-btn premium-btn-primary">
                  {editId ? "Actualizar Usuario" : "Guardar Usuario"}
                </button>
                <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost" style={{ border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  {["ID", "Nombre", "Correo", "Rol", "Fecha Ingreso", "Estado", "Acciones"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.cod_usuario}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{u.cod_usuario}</td>
                    <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>
                      <span style={{ background: 'var(--bg)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                        {getNombreRol(u.cod_rol)}
                      </span>
                    </td>
                    <td>{u.fecha_ingreso?.split("T")[0]}</td>
                    <td>
                      <span style={{ 
                        background: u.cod_estado_usuario === 1 ? 'var(--success)' : 'var(--danger)', 
                        color: 'white', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.85rem' 
                      }}>
                        {u.cod_estado_usuario === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleEditar(u)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border)' }}>
                        Editar
                      </button>
                      <button onClick={() => handleEliminar(u.cod_usuario)} className="premium-btn premium-btn-danger" style={{ padding: '0.4rem 0.8rem' }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No hay usuarios registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
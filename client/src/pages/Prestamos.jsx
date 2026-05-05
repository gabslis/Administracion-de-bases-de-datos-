import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Prestamos() {
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  const vacio = { 
    cod_usuario: "", 
    cod_aula: "", 
    cod_equipo: "", 
    cod_accesorio: "", 
    fecha_salida: new Date().toISOString().split('T')[0], 
    fecha_devolucion_programada: "" 
  };

  const [prestamos, setPrestamos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Data para los selects
  const [usuariosList, setUsuariosList] = useState([]);
  const [equiposList, setEquiposList] = useState([]);
  const [aulasList, setAulasList] = useState([]);
  const [accesoriosList, setAccesoriosList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/prestamos");
      let data = res.data;
      
      // Filtro por roles: Si no es Admin ni Técnico, solo ve los suyos
      if (!isAdminOrTecnico) {
        data = data.filter(p => p.cod_usuario === usuarioActual.cod_usuario);
      }
      
      setPrestamos(data);
    } catch(err) {
      console.error(err);
    }
  };

  const cargarDependencias = async () => {
    if (!isAdminOrTecnico) return; // Solo cargamos esto si pueden asignar
    try {
      const [usrRes, eqRes, auRes, accRes] = await Promise.all([
        api.get("/usuarios"),
        api.get("/equipos"),
        api.get("/aulas"),
        api.get("/accesorios")
      ]);
      setUsuariosList(usrRes.data);
      setEquiposList(eqRes.data);
      setAulasList(auRes.data);
      setAccesoriosList(accRes.data);
    } catch (err) {
      console.error("Error cargando dependencias", err);
    }
  };

  useEffect(() => { 
    cargar(); 
    cargarDependencias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/prestamos", form);
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar asignación?")) return;
    try {
      await api.delete("/prestamos/" + id);
      cargar();
    } catch {
      alert("Error al eliminar");
    }
  };

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>📦 Asignaciones (Préstamos)</h2>
          {isAdminOrTecnico && (
            <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
              className="premium-btn premium-btn-primary">
              + Asignar Equipo
            </button>
          )}
        </div>
        
        {!isAdminOrTecnico && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
            <h4 style={{ margin: 0, color: 'var(--primary)' }}>Mi Inventario Asignado</h4>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Aquí puedes ver los equipos que te han sido asignados por el departamento técnico.</p>
          </div>
        )}

        {isAdminOrTecnico && mostrarForm && (
          <div className="premium-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1.5rem' }}>
              Nueva Asignación
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Usuario Asignado</label>
                <select className="premium-input" value={form.cod_usuario} onChange={e => setForm({...form, cod_usuario: e.target.value})} required>
                  <option value="">Seleccione usuario...</option>
                  {usuariosList.map(u => <option key={u.cod_usuario} value={u.cod_usuario}>{u.nombre}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Equipo</label>
                <select className="premium-input" value={form.cod_equipo} onChange={e => setForm({...form, cod_equipo: e.target.value})} required>
                  <option value="">Seleccione equipo...</option>
                  {equiposList.map(e => <option key={e.cod_equipo} value={e.cod_equipo}>{e.nombre_equipo} ({e.serial})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Aula Destino</label>
                <select className="premium-input" value={form.cod_aula} onChange={e => setForm({...form, cod_aula: e.target.value})} required>
                  <option value="">Seleccione aula...</option>
                  {aulasList.map(a => <option key={a.cod_aula} value={a.cod_aula}>{a.nombre_aula}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Accesorio Adicional</label>
                <select className="premium-input" value={form.cod_accesorio} onChange={e => setForm({...form, cod_accesorio: e.target.value})}>
                  <option value="">Ninguno / Seleccione...</option>
                  {accesoriosList.map(a => <option key={a.cod_accesorio} value={a.cod_accesorio}>{a.nombre_accesorio}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha de Salida</label>
                <input className="premium-input" type="date" value={form.fecha_salida} onChange={e => setForm({...form, fecha_salida: e.target.value})} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha Devolución Programada</label>
                <input className="premium-input" type="date" value={form.fecha_devolucion_programada} onChange={e => setForm({...form, fecha_devolucion_programada: e.target.value})} required />
              </div>
              
              <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Confirmar Asignación
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
                  <th>ID Préstamo</th>
                  <th>Usuario</th>
                  <th>Equipo</th>
                  <th>Aula</th>
                  <th>Fecha Salida</th>
                  <th>Devolución</th>
                  {isAdminOrTecnico && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {prestamos.map((p) => (
                  <tr key={p.cod_prestamo}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{p.cod_prestamo}</td>
                    <td>{p.nombre_usuario || `ID: ${p.cod_usuario}`}</td>
                    <td>
                      <div>{p.nombre_equipo || `ID: ${p.cod_equipo}`}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                        {p.nombre_accesorio ? `+ ${p.nombre_accesorio}` : 'Sin accesorio'}
                      </div>
                    </td>
                    <td>{p.nombre_aula || `ID: ${p.cod_aula}`}</td>
                    <td>{p.fecha_salida?.split("T")[0]}</td>
                    <td>{p.fecha_devolucion_programada?.split("T")[0]}</td>
                    {isAdminOrTecnico && (
                      <td style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleEliminar(p.cod_prestamo)} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {prestamos.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrTecnico ? 7 : 6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay equipos asignados.
                    </td>
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

export default Prestamos;

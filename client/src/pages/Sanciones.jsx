import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Sanciones() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  const vacio = {
    cod_usuario: "",
    cod_equipo: "",
    motivo: "",
    fecha_sancion: new Date().toISOString().split('T')[0]
  };

  const [sanciones, setSanciones] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [usuariosList, setUsuariosList] = useState([]);
  const [equiposList, setEquiposList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/sanciones");
      setSanciones(res.data);
    } catch(err) {
      toast.error("Error al cargar sanciones");
    }
  };

  const cargarDependencias = async () => {
    if (!isAdminOrTecnico) return;
    try {
      const [usrRes, eqRes] = await Promise.all([
        api.get("/usuarios"),
        api.get("/equipos")
      ]);
      setUsuariosList(usrRes.data);
      setEquiposList(eqRes.data);
    } catch(err) {
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
      // Para equipos opcionales si no selecciona manda null
      const data = { ...form };
      if (!data.cod_equipo) delete data.cod_equipo;

      await api.post("/sanciones", data);
      toast.success("Sanción aplicada exitosamente");
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      toast.error("Error al aplicar sanción");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar sanción? Esto devolverá los permisos de préstamo al usuario.")) return;
    try {
      await api.delete("/sanciones/" + id);
      toast.success("Sanción perdonada/eliminada");
      cargar();
    } catch {
      toast.error("Error al eliminar sanción");
    }
  };

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ background: 'linear-gradient(to right, #7f1d1d, #ef4444)', padding: '1.5rem', borderRadius: 'var(--radius)', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚖️ Panel de Sanciones</h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Usuarios sancionados NO podrán solicitar nuevos préstamos.</p>
          </div>
          {isAdminOrTecnico && (
            <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
              className="premium-btn" style={{ background: 'white', color: '#b91c1c' }}>
              + Aplicar Sanción
            </button>
          )}
        </div>

        {isAdminOrTecnico && mostrarForm && (
          <div className="premium-card" style={{ marginBottom: "2rem", borderLeft: '4px solid #b91c1c' }}>
            <h3 style={{ color: "#b91c1c", marginTop: 0, marginBottom: '1.5rem' }}>
              Nueva Penalización
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Usuario a Sancionar</label>
                <select className="premium-input" value={form.cod_usuario} onChange={e => setForm({...form, cod_usuario: e.target.value})} required>
                  <option value="">Seleccione infractor...</option>
                  {usuariosList.map(u => <option key={u.cod_usuario} value={u.cod_usuario}>{u.nombre}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Equipo Afectado (Opcional)</label>
                <select className="premium-input" value={form.cod_equipo} onChange={e => setForm({...form, cod_equipo: e.target.value})}>
                  <option value="">Ninguno / No aplica...</option>
                  {equiposList.map(eq => <option key={eq.cod_equipo} value={eq.cod_equipo}>{eq.nombre_equipo} ({eq.serial})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha de la Sanción</label>
                <input className="premium-input" type="date" value={form.fecha_sancion} onChange={e => setForm({...form, fecha_sancion: e.target.value})} required />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Motivo</label>
                <input className="premium-input" type="text" placeholder="Ej. Pantalla rota tras préstamo, pérdida de cargador..." value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} required />
              </div>
              
              <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                <button type="submit" className="premium-btn premium-btn-danger">
                  Sancionar Usuario
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
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Equipo Afectado</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  {isAdminOrTecnico && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {sanciones.map((s) => (
                  <tr key={s.cod_sancion}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{s.cod_sancion}</td>
                    <td style={{ fontWeight: 600 }}>{s.nombre_usuario || `ID: ${s.cod_usuario}`}</td>
                    <td>{s.nombre_equipo || 'N/A'}</td>
                    <td>{s.fecha_sancion?.split("T")[0]}</td>
                    <td>{s.motivo}</td>
                    {isAdminOrTecnico && (
                      <td style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleEliminar(s.cod_sancion)} className="premium-btn premium-btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                          Perdonar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {sanciones.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrTecnico ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay usuarios sancionados actualmente.
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

export default Sanciones;

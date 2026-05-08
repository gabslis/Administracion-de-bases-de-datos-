import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Incidencias() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  const vacio = {
    cod_prestamo: "",
    descripcion: "",
    fecha_incidencia: new Date().toISOString().split('T')[0],
    cod_gravedad_incidencia: ""
  };

  const [incidencias, setIncidencias] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [prestamosList, setPrestamosList] = useState([]);
  const [gravedadList, setGravedadList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/incidencias");
      setIncidencias(res.data);
    } catch(err) {
      toast.error("Error al cargar incidencias");
    }
  };

  const cargarDependencias = async () => {
    try {
      // Si es admin/tech, carga todos. Si es docente, carga solo sus préstamos
      const prestamosEndpoint = isAdminOrTecnico ? "/prestamos" : `/prestamos/usuario/${usuarioActual.cod_usuario}`;
      const [prestamosRes, gravedadRes] = await Promise.all([
        api.get(prestamosEndpoint),
        api.get("/gravedad_incidencia")
      ]);
      setPrestamosList(prestamosRes.data);
      setGravedadList(gravedadRes.data);
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
      await api.post("/incidencias", form);
      toast.success("Incidencia reportada exitosamente");
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      toast.error("Error al reportar incidencia");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar incidencia?")) return;
    try {
      await api.delete("/incidencias/" + id);
      toast.success("Incidencia eliminada");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>🚨 Reportes de Incidencias</h2>
          <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
            className="premium-btn premium-btn-danger">
            + Reportar Incidencia
          </button>
        </div>

        {mostrarForm && (
          <div className="premium-card" style={{ marginBottom: "2rem", borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ color: "var(--danger)", marginTop: 0, marginBottom: '1.5rem' }}>
              Nueva Incidencia
            </h3>
            <p style={{ color: 'var(--text-h)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {isAdminOrTecnico ? "Reportar incidencia general o de un préstamo específico." : "Selecciona el préstamo donde ocurrió el problema."}
            </p>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Préstamo Relacionado</label>
                <select className="premium-input" value={form.cod_prestamo} onChange={e => setForm({...form, cod_prestamo: e.target.value})} required>
                  <option value="">Seleccione préstamo...</option>
                  {prestamosList.map(p => (
                    <option key={p.cod_prestamo} value={p.cod_prestamo}>
                      #{p.cod_prestamo} - {p.nombre_equipo} {isAdminOrTecnico ? `(${p.nombre_usuario})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Gravedad</label>
                <select className="premium-input" value={form.cod_gravedad_incidencia} onChange={e => setForm({...form, cod_gravedad_incidencia: e.target.value})} required>
                  <option value="">Seleccione gravedad...</option>
                  {gravedadList.map(g => <option key={g.cod_gravedad_incidencia} value={g.cod_gravedad_incidencia}>{g.tipo_gravedad_incidencia}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha de Incidencia</label>
                <input className="premium-input" type="date" value={form.fecha_incidencia} onChange={e => setForm({...form, fecha_incidencia: e.target.value})} required />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Descripción de lo ocurrido</label>
                <textarea className="premium-input" rows="3" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
              </div>
              
              <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Guardar Reporte
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
                  <th>Préstamo</th>
                  <th>Gravedad</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  {isAdminOrTecnico && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {incidencias.map((i) => (
                  <tr key={i.cod_incidencia}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{i.cod_incidencia}</td>
                    <td><span style={{background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>Préstamo #{i.cod_prestamo}</span></td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.8rem', 
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#b91c1c'
                      }}>
                        {i.tipo_gravedad_incidencia || `ID: ${i.cod_gravedad_incidencia}`}
                      </span>
                    </td>
                    <td>{i.fecha_incidencia?.split("T")[0]}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.descripcion}</td>
                    {isAdminOrTecnico && (
                      <td style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleEliminar(i.cod_incidencia)} className="premium-btn premium-btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {incidencias.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrTecnico ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                      No se han reportado incidencias. Todo está en orden. ✨
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

export default Incidencias;

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Sanciones() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  // ── VISTA DEL ADMINISTRADOR / TÉCNICO ──────────────────────────────────────
  const AdminView = () => {
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
      const [sanRes, usrRes, eqRes] = await Promise.all([
        api.get("/sanciones"),
        api.get("/usuarios"),
        api.get("/equipos")
      ]);
      setSanciones(sanRes.data);
      setUsuariosList(usrRes.data);
      setEquiposList(eqRes.data);
    };

    useEffect(() => { cargar(); }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = { ...form };
        if (!data.cod_equipo) delete data.cod_equipo;
        await api.post("/sanciones", data);
        toast.success("Sanción aplicada. El equipo fue marcado como Inactivo.");
        setForm(vacio);
        setMostrarForm(false);
        cargar();
      } catch (err) {
        toast.error(err.response?.data?.error || "Error al aplicar sanción");
      }
    };

    const handleEliminar = async (id) => {
      if (!confirm("¿Levantar la sanción? El equipo asociado volverá a estar Activo.")) return;
      try {
        await api.delete("/sanciones/" + id);
        toast.success("Sanción levantada. El equipo fue restaurado a Activo.");
        cargar();
      } catch {
        toast.error("Error al levantar sanción");
      }
    };

    return (
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', padding: '1.5rem 2rem', borderRadius: 'var(--radius)', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>⚖️ Panel de Sanciones</h2>
            <p style={{ margin: '0.4rem 0 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
              Al sancionar a un usuario el equipo asociado se marca automáticamente como <strong>Inactivo</strong>.
              Al levantar la sanción, el equipo vuelve a <strong>Activo</strong>.
            </p>
          </div>
          <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
            className="premium-btn" style={{ background: 'white', color: '#b91c1c', flexShrink: 0 }}>
            + Aplicar Sanción
          </button>
        </div>

        {/* Formulario */}
        {mostrarForm && (
          <div className="premium-card" style={{ marginBottom: "2rem", borderLeft: '4px solid #b91c1c' }}>
            <h3 style={{ color: "#b91c1c", marginTop: 0 }}>Nueva Penalización</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem" }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Usuario infractor</label>
                <select className="premium-input" value={form.cod_usuario} onChange={e => setForm({...form, cod_usuario: e.target.value})} required>
                  <option value="">Seleccione...</option>
                  {usuariosList.map(u => <option key={u.cod_usuario} value={u.cod_usuario}>{u.nombre}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Equipo dañado/perdido <span style={{color:'gray', fontWeight:400}}>(opcional)</span></label>
                <select className="premium-input" value={form.cod_equipo} onChange={e => setForm({...form, cod_equipo: e.target.value})}>
                  <option value="">Ninguno / no aplica</option>
                  {equiposList.map(eq => <option key={eq.cod_equipo} value={eq.cod_equipo}>{eq.nombre_equipo} — {eq.serial}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha de la sanción</label>
                <input className="premium-input" type="date" value={form.fecha_sancion} onChange={e => setForm({...form, fecha_sancion: e.target.value})} required />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Motivo detallado</label>
                <input className="premium-input" type="text" placeholder="Ej. Pantalla rota, cargador extraviado..." value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} required />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="premium-btn premium-btn-danger">Aplicar Sanción</button>
                <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost" style={{ border: '1px solid var(--border)' }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de sanciones */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario Sancionado</th>
                  <th>Equipo Afectado</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sanciones.map(s => (
                  <tr key={s.cod_sancion}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{s.cod_sancion}</td>
                    <td style={{ fontWeight: 600 }}>{s.nombre_usuario || `ID:${s.cod_usuario}`}</td>
                    <td>
                      {s.nombre_equipo
                        ? <span style={{ background: 'rgba(239,68,68,0.12)', color: '#b91c1c', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.82rem' }}>🔒 {s.nombre_equipo}</span>
                        : <span style={{ color: 'var(--text-h)', fontSize: '0.85rem' }}>— general —</span>}
                    </td>
                    <td>{s.fecha_sancion?.split("T")[0]}</td>
                    <td>{s.motivo}</td>
                    <td>
                      <button onClick={() => handleEliminar(s.cod_sancion)} className="premium-btn premium-btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>
                        Levantar ✓
                      </button>
                    </td>
                  </tr>
                ))}
                {sanciones.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-h)' }}>
                      ✅ No hay sanciones activas actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── VISTA DEL DOCENTE ──────────────────────────────────────────────────────
  const DocenteView = () => {
    const [misSanciones, setMisSanciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      api.get(`/sanciones/usuario/${usuarioActual.cod_usuario}`)
        .then(res => setMisSanciones(res.data))
        .catch(() => {})
        .finally(() => setCargando(false));
    }, []);

    if (cargando) return <div style={{ padding: '2rem' }}>Cargando...</div>;

    return (
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>⚖️ Mis Sanciones</h2>
        
        {misSanciones.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
            <h3 style={{ margin: 0, color: 'var(--success)' }}>No tienes sanciones activas</h3>
            <p style={{ color: 'var(--text-h)' }}>Tu historial está limpio. ¡Sigue así!</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <strong style={{ color: '#b91c1c' }}>Tienes {misSanciones.length} sanción(es) activa(s)</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                  Comunícate con el área de sistemas o el técnico responsable para resolverlas.
                </p>
              </div>
            </div>
            
            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="premium-table">
                <thead>
                  <tr><th>Fecha</th><th>Equipo Involucrado</th><th>Motivo</th></tr>
                </thead>
                <tbody>
                  {misSanciones.map(s => (
                    <tr key={s.cod_sancion}>
                      <td>{s.fecha_sancion?.split("T")[0]}</td>
                      <td>{s.nombre_equipo ? `${s.nombre_equipo} (${s.serial})` : '— general —'}</td>
                      <td>{s.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  return isAdminOrTecnico ? <AdminView /> : <DocenteView />;
}

export default Sanciones;

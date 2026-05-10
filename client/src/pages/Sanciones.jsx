import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gavel, 
  Plus, 
  Trash2, 
  User, 
  Monitor, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  X,
  Search,
  Clock,
  ShieldAlert
} from "lucide-react";
import api from "../api/axios";

function Sanciones() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isAdminOrTecnico = userRole === 1 || userRole === 4;


  // ── VISTA DEL ADMINISTRADOR / TÉCNICO ──────────────────────────────────────
  const AdminView = () => {
    const vacio = {
      cod_usuario: "",
      cod_equipo: "",
      motivo: "",
      fecha_sancion: new Date().toISOString().split('T')[0]
    };

    const [sanciones, setSanciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState(vacio);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [usuariosList, setUsuariosList] = useState([]);
    const [equiposList, setEquiposList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const cargar = async () => {
      setIsLoading(true);
      try {
        const safeFetch = async (url) => {
          try {
            const res = await api.get(url);
            return res.data;
          } catch (e) {
            console.warn(`Error en ${url}:`, e.message);
            return [];
          }
        };

        const [sanRes, usrRes, eqRes] = await Promise.all([
          safeFetch("/sanciones"),
          safeFetch("/usuarios/selector"),
          safeFetch("/equipos")
        ]);
        
        setSanciones(sanRes);
        setUsuariosList(usrRes);
        setEquiposList(eqRes);
      } catch (err) {
        toast.error("Error al sincronizar datos");
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    useEffect(() => { cargar(); }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = { ...form };
        if (!data.cod_equipo) delete data.cod_equipo;
        await api.post("/sanciones", data);
        toast.success("Penalización aplicada exitosamente");
        setForm(vacio);
        setMostrarForm(false);
        cargar();
      } catch (err) {
        toast.error(err.response?.data?.error || "Error al aplicar sanción");
      }
    };

    const handleEliminar = async (id) => {
      if (!confirm("¿Deseas levantar esta sanción? El equipo asociado volverá a estar disponible.")) return;
      try {
        await api.delete("/sanciones/" + id);
        toast.success("Sanción levantada correctamente");
        cargar();
      } catch {
        toast.error("No se pudo levantar la sanción");
      }
    };

    const filteredSanciones = sanciones.filter(s => 
      (s.nombre_usuario || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.motivo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nombre_equipo || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Control de Sanciones</h2>
            <p style={{ color: 'var(--text)' }}>Administración de penalizaciones y bloqueos de equipos.</p>
          </div>
          <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
            className="premium-btn premium-btn-danger">
            {mostrarForm ? <X size={18} /> : <Plus size={18} />}
            {mostrarForm ? 'Cancelar' : 'Aplicar Penalización'}
          </button>
        </header>

        <AnimatePresence>
          {mostrarForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
              <div className="premium-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                  <ShieldAlert size={20} /> Formulario de Sanción
                </h3>
                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Usuario a Sancionar</label>
                    <select className="premium-input" value={form.cod_usuario} onChange={e => setForm({...form, cod_usuario: e.target.value})} required>
                      <option value="">Seleccione infractor...</option>
                      {usuariosList.map(u => <option key={u.cod_usuario} value={u.cod_usuario}>{u.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Equipo Involucrado (Opcional)</label>
                    <select className="premium-input" value={form.cod_equipo} onChange={e => setForm({...form, cod_equipo: e.target.value})}>
                      <option value="">Ninguno</option>
                      {equiposList.map(eq => <option key={eq.cod_equipo} value={eq.cod_equipo}>{eq.nombre_equipo} — {eq.serial}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Fecha de Registro</label>
                    <input className="premium-input" type="date" value={form.fecha_sancion} onChange={e => setForm({...form, fecha_sancion: e.target.value})} required />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Motivo de la Sanción</label>
                    <textarea className="premium-input" placeholder="Describa el motivo detalladamente..." value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} required rows={3} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="premium-btn premium-btn-danger">Registrar Sanción</button>
                    <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost">Descartar</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="premium-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)', opacity: 0.5 }} />
              <input type="text" placeholder="Buscar por usuario o motivo..." className="premium-input" style={{ paddingLeft: '3rem' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Equipo Afectado</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: '2.5rem', margin: '0.5rem 0' }}></div></td></tr>
                  ))
                ) : filteredSanciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                      <div style={{ opacity: 0.5, marginBottom: '1rem' }}><CheckCircle2 size={48} style={{ margin: '0 auto' }} /></div>
                      No hay sanciones activas registradas.
                    </td>
                  </tr>
                ) : (
                  filteredSanciones.map((s, idx) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={s.cod_sancion}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: 'var(--danger-light)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                            <User size={16} />
                          </div>
                          <div style={{ fontWeight: 600 }}>{s.nombre_usuario || `ID: ${s.cod_usuario}`}</div>
                        </div>
                      </td>
                      <td>
                        {s.nombre_equipo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 500 }}>
                            <Monitor size={14} /> {s.nombre_equipo}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text)', opacity: 0.6 }}>— General —</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                          <Calendar size={14} style={{ opacity: 0.5 }} />
                          {s.fecha_sancion?.split("T")[0]}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-h)' }}>{s.motivo}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleEliminar(s.cod_sancion)} className="premium-btn premium-btn-ghost" style={{ padding: '0.5rem', color: 'var(--success)' }} title="Levantar Sanción">
                          <CheckCircle2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      api.get(`/sanciones/usuario/${usuarioActual.cod_usuario}`)
        .then(res => setMisSanciones(res.data))
        .catch(() => {})
        .finally(() => setTimeout(() => setIsLoading(false), 500));
    }, []);

    if (isLoading) return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Clock className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
        <p>Cargando tu historial...</p>
      </div>
    );

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>Mis Penalizaciones</h2>
        
        {misSanciones.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>¡Todo en orden!</h3>
            <p style={{ color: 'var(--text)' }}>No tienes sanciones activas en este momento. Sigue manteniendo el buen uso de los equipos.</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--danger)', display: 'block', fontSize: '1.1rem' }}>Tienes {misSanciones.length} sanción(es) pendiente(s)</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                  Por favor, acércate al departamento técnico para resolver estos inconvenientes y poder solicitar nuevos equipos.
                </p>
              </div>
            </div>
            
            <div className="premium-card" style={{ padding: 0 }}>
              <table className="premium-table">
                <thead>
                  <tr><th>Fecha</th><th>Equipo</th><th>Motivo</th></tr>
                </thead>
                <tbody>
                  {misSanciones.map(s => (
                    <tr key={s.cod_sancion}>
                      <td style={{ fontWeight: 600 }}>{s.fecha_sancion?.split("T")[0]}</td>
                      <td>{s.nombre_equipo ? `${s.nombre_equipo} (${s.serial})` : 'General'}</td>
                      <td style={{ color: 'var(--text)' }}>{s.motivo}</td>
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {isAdminOrTecnico ? <AdminView /> : <DocenteView />}
    </motion.div>
  );
}

export default Sanciones;

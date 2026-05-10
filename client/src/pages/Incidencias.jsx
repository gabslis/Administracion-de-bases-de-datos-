import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  Activity, 
  Package, 
  User, 
  FileText,
  X,
  AlertCircle,
  Clock
} from "lucide-react";
import api from "../api/axios";

function Incidencias() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isAdminOrTecnico = userRole === 1 || userRole === 4;


  const vacio = {
    cod_prestamo: "",
    descripcion: "",
    fecha_incidencia: new Date().toISOString().split('T')[0],
    cod_gravedad_incidencia: ""
  };

  const [incidencias, setIncidencias] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [prestamosList, setPrestamosList] = useState([]);
  const [gravedadList, setGravedadList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/incidencias");
      setIncidencias(res.data);
    } catch(err) {
      toast.error("Error al sincronizar incidencias");
    }
  };

  const cargarDependencias = async () => {
    try {
      const prestamosEndpoint = isAdminOrTecnico ? "/prestamos" : `/prestamos/usuario/${usuarioActual.cod_usuario}`;
      const [prestamosRes, gravedadRes] = await Promise.all([
        api.get(prestamosEndpoint),
        api.get("/incidencias/gravedad")
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
      toast.success("Reporte de incidencia enviado");
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      toast.error("Error al registrar incidencia");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas descartar este reporte de incidencia?")) return;
    try {
      await api.delete("/incidencias/" + id);
      toast.success("Incidencia descartada");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const filteredIncidencias = incidencias.filter(i => 
    (i.descripcion || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.cod_prestamo || "").toString().includes(searchQuery)
  );


  const getGravedadStyles = (id) => {
    const configs = {
      1: { color: '#22c55e', bg: '#22c55e15', label: 'Leve' },
      2: { color: '#f59e0b', bg: '#f59e0b15', label: 'Moderada' },
      3: { color: '#ef4444', bg: '#ef444415', label: 'Crítica' }
    };
    return configs[id] || { color: 'var(--text)', bg: 'var(--bg-sec)', label: 'Desconocida' };
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Gestión de Incidencias</h2>
          <p style={{ color: 'var(--text)' }}>Reporta fallos o daños en los equipos asignados.</p>
        </div>
        {isAdminOrTecnico && (
          <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
            className="premium-btn premium-btn-danger">
            {mostrarForm ? <X size={18} /> : <AlertTriangle size={18} />}
            {mostrarForm ? 'Cerrar Reporte' : 'Reportar Incidencia'}
          </button>
        )}
      </header>

      <AnimatePresence>
        {mostrarForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div className="premium-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} /> Detalles de la Incidencia
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Préstamo Relacionado</label>
                  <select className="premium-input" value={form.cod_prestamo} onChange={e => setForm({...form, cod_prestamo: e.target.value})} required>
                    <option value="">Seleccione el activo...</option>
                    {prestamosList.map(p => (
                      <option key={p.cod_prestamo} value={p.cod_prestamo}>
                        #{p.cod_prestamo} - {p.nombre_equipo} {isAdminOrTecnico ? `(${p.nombre_usuario})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Nivel de Gravedad</label>
                  <select className="premium-input" value={form.cod_gravedad_incidencia} onChange={e => setForm({...form, cod_gravedad_incidencia: e.target.value})} required>
                    <option value="">Seleccione prioridad...</option>
                    {gravedadList.map(g => <option key={g.cod_gravedad_incidencia} value={g.cod_gravedad_incidencia}>{g.tipo_gravedad_incidencia}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Fecha de lo ocurrido</label>
                  <input className="premium-input" type="date" value={form.fecha_incidencia} onChange={e => setForm({...form, fecha_incidencia: e.target.value})} required />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Descripción Detallada</label>
                  <textarea className="premium-input" rows="3" placeholder="Describe qué sucedió y el estado actual del equipo..." value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
                </div>
                
                <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem" }}>
                  <button type="submit" className="premium-btn premium-btn-danger" style={{ background: '#ef4444', color: 'white', border: 'none' }}>
                    Enviar Reporte Crítico
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
            <input type="text" placeholder="Filtrar por descripción o préstamo..." className="premium-input" style={{ paddingLeft: '3rem' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Préstamo Origen</th>
                <th>Gravedad</th>
                <th>Fecha Reporte</th>
                <th>Descripción de Hallazgos</th>
                {isAdminOrTecnico && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredIncidencias.map((i, idx) => {
                const style = getGravedadStyles(i.cod_gravedad_incidencia);
                return (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={i.cod_incidencia}>
                    <td style={{ color: "var(--primary)", fontWeight: 700 }}>#{i.cod_incidencia}</td>
                    <td>
                      <div className="badge" style={{ backgroundColor: 'var(--bg-sec)', color: 'var(--text-h)' }}>
                        <Package size={12} /> Préstamo #{i.cod_prestamo}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: style.bg, color: style.color }}>
                        <Activity size={12} /> {style.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} style={{ opacity: 0.5 }} />
                        {i.fecha_incidencia?.split("T")[0]}
                      </div>
                    </td>
                    <td style={{ maxWidth: '350px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <FileText size={16} style={{ marginTop: '0.2rem', opacity: 0.4, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9rem', lineHeight: 1.4, color: 'var(--text-h)' }}>{i.descripcion}</span>
                      </div>
                    </td>
                    {isAdminOrTecnico && (
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleEliminar(i.cod_incidencia)} className="premium-btn premium-btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
              {filteredIncidencias.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrTecnico ? 6 : 5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>✨</div>
                    No hay incidencias reportadas. Todo funciona correctamente.
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

export default Incidencias;

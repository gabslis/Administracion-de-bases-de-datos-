import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  User, 
  Monitor, 
  MapPin, 
  Calendar, 
  Trash2, 
  Search,
  Hash,
  X,
  PlusSquare,
  CheckCircle2
} from "lucide-react";
import api from "../api/axios";

function Prestamos() {
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isAdminOrTecnico = userRole === 1 || userRole === 4;


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
  const [searchQuery, setSearchQuery] = useState("");

  const [usuariosList, setUsuariosList] = useState([]);
  const [equiposList, setEquiposList] = useState([]);
  const [aulasList, setAulasList] = useState([]);
  const [accesoriosList, setAccesoriosList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/prestamos");
      setPrestamos(res.data);
    } catch(err) {
      toast.error("Error al cargar préstamos");
    }
  };

  const cargarDependencias = async () => {
    if (!isAdminOrTecnico) return;
    try {
      console.log("[Debug] Cargando dependencias para rol:", userRole);
      const [usrRes, eqRes, auRes, accRes] = await Promise.all([
        api.get("/usuarios"),
        api.get("/equipos"),
        api.get("/prestamos/aulas"),
        api.get("/prestamos/accesorios")
      ]);
      console.log("[Debug] Dependencias cargadas:", {
        usuarios: usrRes.data.length,
        equipos: eqRes.data.length,
        aulas: auRes.data.length
      });
      setUsuariosList(usrRes.data);
      setEquiposList(eqRes.data.filter(e => e.cod_estado_equipo === 1)); // Solo equipos disponibles
      setAulasList(auRes.data);
      setAccesoriosList(accRes.data);
    } catch (err) {
      console.error("[Debug Error] Error cargando dependencias de préstamos:", err.response?.status, err.message);
      toast.error("Fallo al cargar listas de selección");
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
      toast.success("Asignación completada con éxito");
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      toast.error(err.response?.data?.error || "Error al procesar asignación");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas revocar esta asignación?")) return;
    try {
      await api.delete("/prestamos/" + id);
      toast.success("Asignación revocada");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const filteredPrestamos = prestamos.filter(p => 
    (p.nombre_usuario || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nombre_equipo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nombre_aula || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nombre_edificio || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.cod_prestamo || "").toString().includes(searchQuery)
  );




  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Préstamos y Asignaciones</h2>
          <p style={{ color: 'var(--text)' }}>Control de activos tecnológicos entregados a usuarios.</p>
        </div>
        {isAdminOrTecnico && (
          <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
            className="premium-btn premium-btn-primary">
            {mostrarForm ? <X size={18} /> : <Plus size={18} />}
            {mostrarForm ? 'Cancelar' : 'Nueva Asignación'}
          </button>
        )}
      </header>

      {!isAdminOrTecnico && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Mis Equipos Asignados</h4>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text)', fontSize: '0.9rem' }}>Consulta los activos que tienes bajo tu responsabilidad.</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isAdminOrTecnico && mostrarForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div className="premium-card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusSquare size={20} style={{ color: 'var(--primary)' }} /> Nueva Hoja de Asignación
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Usuario Beneficiario</label>
                  <select className="premium-input" value={form.cod_usuario} onChange={e => setForm({...form, cod_usuario: e.target.value})} required>
                    <option value="">Seleccione usuario...</option>
                    {usuariosList.map(u => <option key={u.cod_usuario} value={u.cod_usuario}>{u.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Equipo a Entregar</label>
                  <select className="premium-input" value={form.cod_equipo} onChange={e => setForm({...form, cod_equipo: e.target.value})} required>
                    <option value="">Seleccione equipo...</option>
                    {equiposList.map(e => <option key={e.cod_equipo} value={e.cod_equipo}>{e.nombre_equipo} ({e.serial})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Aula / Ubicación</label>
                  <select className="premium-input" value={form.cod_aula} onChange={e => setForm({...form, cod_aula: e.target.value})} required>
                    <option value="">Seleccione aula...</option>
                    {aulasList.map(a => (
                      <option key={a.cod_aula} value={a.cod_aula}>
                        {a.nombre_aula} {a.nombre_edificio ? `- ${a.nombre_edificio}` : ''}
                      </option>
                    ))}

                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Accesorio (Opcional)</label>
                  <select className="premium-input" value={form.cod_accesorio} onChange={e => setForm({...form, cod_accesorio: e.target.value})}>
                    <option value="">Ninguno</option>
                    {accesoriosList.map(a => <option key={a.cod_accesorio} value={a.cod_accesorio}>{a.nombre_accesorio}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Fecha de Salida</label>
                  <input className="premium-input" type="date" value={form.fecha_salida} onChange={e => setForm({...form, fecha_salida: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Devolución Programada</label>
                  <input className="premium-input" type="date" value={form.fecha_devolucion_programada} onChange={e => setForm({...form, fecha_devolucion_programada: e.target.value})} required />
                </div>
                <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem" }}>
                  <button type="submit" className="premium-btn premium-btn-primary">Registrar Préstamo</button>
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
            <input type="text" placeholder="Buscar por usuario, equipo o ID..." className="premium-input" style={{ paddingLeft: '3rem' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th><Hash size={16} /> ID</th>
                <th><User size={16} /> Beneficiario</th>
                <th><Monitor size={16} /> Equipo</th>
                <th><MapPin size={16} /> Ubicación</th>
                <th>Salida</th>
                <th>Devolución</th>
                {isAdminOrTecnico && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPrestamos.map((p, idx) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={p.cod_prestamo}>
                  <td style={{ color: "var(--primary)", fontWeight: 700 }}>#{p.cod_prestamo}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{p.nombre_usuario}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.nombre_equipo}</div>
                    {p.nombre_accesorio && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>+ {p.nombre_accesorio}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.nombre_aula}</div>
                    {p.nombre_edificio && <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.nombre_edificio}</div>}
                  </td>

                  <td style={{ fontSize: '0.875rem' }}>{p.fecha_salida?.split("T")[0]}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} />
                      {p.fecha_devolucion_programada?.split("T")[0]}
                    </div>
                  </td>
                  {isAdminOrTecnico && (
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleEliminar(p.cod_prestamo)} className="premium-btn premium-btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </motion.tr>
              ))}
              {filteredPrestamos.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrTecnico ? 7 : 6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                    No se encontraron registros de asignación.
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

export default Prestamos;

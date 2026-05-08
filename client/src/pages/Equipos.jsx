import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Monitor, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Tag, 
  Activity, 
  Cpu,
  Hash,
  X
} from "lucide-react";
import api from "../api/axios";

function Equipos() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  const vacio = { serial: "", cod_marca: "", nombre_equipo: "", cod_estado_equipo: "" };

  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [marcasList, setMarcasList] = useState([]);
  const [estadosList, setEstadosList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const cargar = async () => {
    try {
      const res = await api.get("/equipos");
      setEquipos(res.data);
    } catch {
      toast.error("Error al cargar equipos");
    }
  };

  const cargarDependencias = async () => {
    try {
      const [marcasRes, estadosRes] = await Promise.all([
        api.get("/equipos/marcas"),
        api.get("/equipos/estados")
      ]);
      setMarcasList(marcasRes.data);
      setEstadosList(estadosRes.data);
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
      await api.post("/equipos", form);
      toast.success("Equipo registrado exitosamente");
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch {
      toast.error("Error al registrar");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar equipo?")) return;
    try {
      await api.delete("/equipos/" + id);
      toast.success("Equipo eliminado");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const filteredEquipos = equipos.filter(e => 
    e.nombre_equipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBadge = (id) => {
    const estado = estadosList.find(x => x.cod_estado_equipo === id);
    const label = estado ? estado.tipo_estado_equipo : 'Desconocido';
    const isActivo = id === 1;
    
    return (
      <span className={`badge ${isActivo ? 'badge-success' : 'badge-danger'}`}>
        <Activity size={12} /> {label}
      </span>
    );
  };

  if (!isAdminOrTecnico) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div style={{ background: 'var(--primary-light)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Monitor size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Acceso Restringido</h3>
          <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>Solo administradores y técnicos pueden gestionar el inventario.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Inventario Global</h2>
          <p style={{ color: 'var(--text)' }}>Administra y supervisa los activos tecnológicos del sistema.</p>
        </div>
        <button 
          onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
          className="premium-btn premium-btn-primary"
        >
          {mostrarForm ? <X size={18} /> : <Plus size={18} />}
          {mostrarForm ? 'Cancelar Registro' : 'Registrar Nuevo Equipo'}
        </button>
      </header>

      <AnimatePresence>
        {mostrarForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '2.5rem' }}
          >
            <div className="premium-card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} style={{ color: 'var(--primary)' }} /> Detalles del Equipo
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Serial / Etiqueta</label>
                  <input className="premium-input" type="text" placeholder="Ej. SN-123456" value={form.serial} onChange={e => setForm({...form, serial: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Nombre del Modelo</label>
                  <input className="premium-input" type="text" placeholder="Ej. MacBook Pro M3" value={form.nombre_equipo} onChange={e => setForm({...form, nombre_equipo: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Marca</label>
                  <select className="premium-input" value={form.cod_marca} onChange={e => setForm({...form, cod_marca: e.target.value})} required>
                    <option value="">Seleccione una marca...</option>
                    {marcasList.map(m => <option key={m.cod_marca} value={m.cod_marca}>{m.nombre_marca}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Estado Inicial</label>
                  <select className="premium-input" value={form.cod_estado_equipo} onChange={e => setForm({...form, cod_estado_equipo: e.target.value})} required>
                    <option value="">Seleccione estado...</option>
                    {estadosList.map(e => <option key={e.cod_estado_equipo} value={e.cod_estado_equipo}>{e.tipo_estado_equipo}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                  <button type="submit" className="premium-btn premium-btn-primary">Guardar en Inventario</button>
                  <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost">Descartar</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="premium-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o serial..." 
              className="premium-input" 
              style={{ paddingLeft: '3rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="premium-btn premium-btn-ghost"
            onClick={() => { setSearchQuery(""); cargar(); toast.success("Filtros limpiados"); }}
          >
            <Filter size={18} /> Limpiar
          </button>

        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th><Hash size={16} /> ID</th>
                <th>Serial</th>
                <th>Equipo / Modelo</th>
                <th>Marca</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipos.map((e, index) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  key={e.cod_equipo}
                >
                  <td style={{ color: "var(--primary)", fontWeight: 700 }}>#{e.cod_equipo}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{e.serial}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{e.nombre_equipo}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={14} style={{ color: 'var(--primary)' }} />
                      {marcasList.find(m => m.cod_marca === e.cod_marca)?.nombre_marca || e.cod_marca}
                    </span>
                  </td>
                  <td>{renderBadge(e.cod_estado_equipo)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleEliminar(e.cod_equipo)} 
                      className="premium-btn premium-btn-ghost" 
                      style={{ padding: '0.5rem', color: 'var(--danger)', borderRadius: '8px' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredEquipos.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                    No se encontraron equipos que coincidan con la búsqueda.
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

export default Equipos;

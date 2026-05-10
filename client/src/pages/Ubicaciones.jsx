import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Home, 
  DoorOpen, 
  Search,
  Building2,
  ChevronRight,
  X
} from "lucide-react";
import api from "../api/axios";

function Ubicaciones() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isAdminOrTecnico = userRole === 1 || userRole === 4;


  const [edificios, setEdificios] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mostrarFormEdificio, setMostrarFormEdificio] = useState(false);
  const [mostrarFormAula, setMostrarFormAula] = useState(false);

  const [formEdificio, setFormEdificio] = useState({ nombre_edificio: "" });
  const [formAula, setFormAula] = useState({ nombre_aula: "", cod_edificio: "" });

  const cargar = async () => {
    setIsLoading(true);
    try {
      const [resEd, resAu] = await Promise.all([
        api.get("/ubicaciones/edificios"),
        api.get("/ubicaciones/aulas")
      ]);
      setEdificios(resEd.data);
      setAulas(resAu.data);
    } catch(err) {
      toast.error("Error al sincronizar ubicaciones");
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleAddEdificio = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ubicaciones/edificios", formEdificio);
      toast.success("Edificio registrado");
      setFormEdificio({ nombre_edificio: "" });
      setMostrarFormEdificio(false);
      cargar();
    } catch {
      toast.error("Error al registrar edificio");
    }
  };

  const handleAddAula = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ubicaciones/aulas", formAula);
      toast.success("Aula registrada correctamente");
      setFormAula({ nombre_aula: "", cod_edificio: "" });
      setMostrarFormAula(false);
      cargar();
    } catch {
      toast.error("Error al registrar aula");
    }
  };

  const handleDeleteEdificio = async (id) => {
    if (!confirm("¿Deseas eliminar este edificio?")) return;
    try {
      await api.delete("/ubicaciones/edificios/" + id);
      toast.success("Edificio removido");
      cargar();
    } catch {
      toast.error("No se puede eliminar (existen aulas vinculadas)");
    }
  };

  const handleDeleteAula = async (id) => {
    if (!confirm("¿Deseas eliminar esta aula?")) return;
    try {
      await api.delete("/ubicaciones/aulas/" + id);
      toast.success("Aula removida");
      cargar();
    } catch {
      toast.error("Error al eliminar aula");
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Infraestructura Institucional</h2>
          <p style={{ color: 'var(--text)' }}>Gestiona los edificios y aulas donde se ubican los activos.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
        
        {/* PANEL EDIFICIOS */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              <Building2 size={24} style={{ color: 'var(--primary)' }} /> Edificios
            </h3>
            {isAdminOrTecnico && (
              <button onClick={() => setMostrarFormEdificio(!mostrarFormEdificio)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                {mostrarFormEdificio ? <X size={16} /> : <Plus size={16} />} {mostrarFormEdificio ? 'Cancelar' : 'Nuevo'}
              </button>
            )}
          </div>

          <AnimatePresence>
            {mostrarFormEdificio && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div className="premium-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <form onSubmit={handleAddEdificio} style={{ display: 'flex', gap: '1rem' }}>
                    <input className="premium-input" placeholder="Nombre del Edificio (Ej. Edificio A)" value={formEdificio.nombre_edificio} onChange={e => setFormEdificio({nombre_edificio: e.target.value})} required />
                    <button type="submit" className="premium-btn premium-btn-primary">Añadir</button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="premium-card" style={{ padding: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Edificio</th>
                  {isAdminOrTecnico && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {edificios.map((ed, idx) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={ed.cod_edificio}>
                    <td style={{ color: "var(--primary)", fontWeight: 700 }}>#{ed.cod_edificio}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{ed.nombre_edificio}</td>
                    {isAdminOrTecnico && (
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteEdificio(ed.cod_edificio)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PANEL AULAS */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              <DoorOpen size={24} style={{ color: 'var(--primary)' }} /> Aulas / Salones
            </h3>
            {isAdminOrTecnico && (
              <button onClick={() => setMostrarFormAula(!mostrarFormAula)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                {mostrarFormAula ? <X size={16} /> : <Plus size={16} />} {mostrarFormAula ? 'Cancelar' : 'Nueva'}
              </button>
            )}
          </div>

          <AnimatePresence>
            {mostrarFormAula && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div className="premium-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <form onSubmit={handleAddAula} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <select className="premium-input" value={formAula.cod_edificio} onChange={e => setFormAula({...formAula, cod_edificio: e.target.value})} required>
                      <option value="">Edificio...</option>
                      {edificios.map(ed => <option key={ed.cod_edificio} value={ed.cod_edificio}>{ed.nombre_edificio}</option>)}
                    </select>
                    <input className="premium-input" placeholder="Nombre Aula" value={formAula.nombre_aula} onChange={e => setFormAula({...formAula, nombre_aula: e.target.value})} required />
                    <button type="submit" className="premium-btn premium-btn-primary" style={{ gridColumn: '1/-1' }}>Registrar Aula</button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="premium-card" style={{ padding: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Aula</th>
                  <th>Edificio</th>
                  {isAdminOrTecnico && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {aulas.map((au, idx) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={au.cod_aula}>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} style={{ color: 'var(--primary)' }} />
                        {au.nombre_aula}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {edificios.find(x => x.cod_edificio === au.cod_edificio)?.nombre_edificio || '—'}
                      </span>
                    </td>
                    {isAdminOrTecnico && (
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteAula(au.cod_aula)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Ubicaciones;

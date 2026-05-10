import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings2, 
  Plus, 
  Trash2, 
  Search, 
  Database, 
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  Tag,
  AlertOctagon,
  Monitor
} from "lucide-react";
import api from "../api/axios";

const catalogos = [
  { id: 'roles', title: 'Roles de Usuario', endpoint: '/catalogos/roles', keyId: 'cod_rol', keyName: 'nombre_rol', icon: ShieldCheck },
  { id: 'estado_usuario', title: 'Estados de Usuario', endpoint: '/catalogos/estado_usuario', keyId: 'cod_estado_usuario', keyName: 'tipo_estado_usuario', icon: Activity },
  { id: 'estado_mantenimiento', title: 'Estados de Mantenimiento', endpoint: '/catalogos/estado_mantenimiento', keyId: 'cod_estado_mantenimiento', keyName: 'tipo_estado_mantenimiento', icon: Layers },
  { id: 'tipo_mantenimiento', title: 'Tipos de Mantenimiento', endpoint: '/catalogos/tipo_mantenimiento', keyId: 'cod_tipo_mantenimiento', keyName: 'tipo_mantenimiento', icon: Settings2 },
  { id: 'marcas', title: 'Marcas', endpoint: '/catalogos/marcas', keyId: 'cod_marca', keyName: 'nombre_marca', icon: Tag },
  { id: 'estado_equipo', title: 'Estados de Equipo', endpoint: '/catalogos/estado_equipo', keyId: 'cod_estado_equipo', keyName: 'tipo_estado_equipo', icon: Monitor },
  { id: 'gravedad_incidencia', title: 'Gravedad de Incidencias', endpoint: '/catalogos/gravedad_incidencia', keyId: 'cod_gravedad_incidencia', keyName: 'tipo_gravedad_incidencia', icon: AlertOctagon },
  { id: 'accesorios', title: 'Accesorios Base', endpoint: '/catalogos/accesorios', keyId: 'cod_accesorio', keyName: 'nombre_accesorio', icon: Database },
];

function Configuracion() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuarioActual ? Number(usuarioActual.cod_rol) : null;
  const isAdmin = userRole === 1;


  const [activeTab, setActiveTab] = useState(catalogos[0]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nuevoValor, setNuevoValor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(activeTab.endpoint);
      setData(res.data);
    } catch (err) {
      toast.error("Error al cargar " + activeTab.title);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    cargarDatos();
    setNuevoValor("");
    setSearchQuery("");
  }, [activeTab]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const val = item[activeTab.keyName];
      return (val || "").toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, activeTab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nuevoValor.trim()) return;
    try {
      const payload = { [activeTab.keyName]: nuevoValor };
      if (activeTab.id === 'accesorios') payload.cod_marca = 1; 
      
      await api.post(activeTab.endpoint, payload);
      toast.success(`${activeTab.title} actualizado`);
      setNuevoValor("");
      cargarDatos();
    } catch {
      toast.error("Error al guardar. Verifica las dependencias de la DB.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar registro? Esto podría afectar la integridad de otros datos.")) return;
    try {
      await api.delete(`${activeTab.endpoint}/${id}`);
      toast.success("Registro eliminado");
      cargarDatos();
    } catch {
      toast.error("No se puede eliminar: El registro está siendo utilizado actualmente.");
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ background: 'var(--primary-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Settings2 size={32} />
          </div>
          <h3>Acceso Restringido</h3>
          <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>Solo administradores globales pueden modificar los catálogos del sistema.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Configuración de Catálogos</h2>
        <p style={{ color: 'var(--text)' }}>Administra las opciones maestras que alimentan todo el sistema.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* MENU LATERAL */}
        <aside className="premium-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {catalogos.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab.id === cat.id ? 'var(--primary)' : 'transparent',
                    color: activeTab.id === cat.id ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: activeTab.id === cat.id ? 700 : 500,
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  {cat.title}
                  {activeTab.id === cat.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <section>
          <div className="premium-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} style={{ color: 'var(--primary)' }} /> Nuevo Registro para {activeTab.title}
            </h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                className="premium-input" 
                value={nuevoValor} 
                onChange={e => setNuevoValor(e.target.value)} 
                placeholder={`Nombre del nuevo ${activeTab.title.toLowerCase()}...`}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="premium-btn premium-btn-primary">Guardar Registro</button>
            </form>
          </div>

          <div className="premium-card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative', maxWidth: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="Buscar en este catálogo..." 
                  className="premium-input" 
                  style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>ID</th>
                    <th>Descripción / Valor</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i}><td colSpan={3}><div className="skeleton" style={{ height: '2.5rem', margin: '0.5rem 0' }}></div></td></tr>
                      ))
                    ) : filteredData.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No se encontraron registros.</td></tr>
                    ) : (
                      filteredData.map((item, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          key={item[activeTab.keyId]}
                        >
                          <td style={{ color: "var(--primary)", fontWeight: 700 }}>#{item[activeTab.keyId]}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{item[activeTab.keyName]}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDelete(item[activeTab.keyId])} 
                              className="premium-btn premium-btn-ghost" 
                              style={{ padding: '0.4rem', color: 'var(--danger)' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Configuracion;

import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  User,
  Monitor,
  ArrowRight,
  FileText,
  Trash2,
  ChevronRight,
  X
} from "lucide-react";
import api from "../api/axios";

function Mantenimientos() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isTecnico = usuarioActual?.cod_rol === 4;
  const isAdmin = usuarioActual?.cod_rol === 1;
  const isDocenteOrDirector = usuarioActual?.cod_rol === 2 || usuarioActual?.cod_rol === 3;
  const isAdminOrTecnico = isTecnico || isAdmin;

  const [mantenimientos, setMantenimientos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [misEquipos, setMisEquipos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formCrear, setFormCrear] = useState({
    cod_equipo: "",
    cod_tipo_mantenimiento: "",
    descripcion_problema: "",
  });

  const [ticketAceptar, setTicketAceptar] = useState(null);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [ticketDetalles, setTicketDetalles] = useState(null);

  const cargarDatos = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        api.get("/mantenimientos/tipos"),
        api.get("/mantenimientos")
      ]);
      setTipos(tRes.data);

      let mData = mRes.data;
      if (isDocenteOrDirector) {
        mData = mData.filter(m => m.cod_usuario === usuarioActual.cod_usuario);
      }
      setMantenimientos(mData);

      if (isDocenteOrDirector) {
        const pRes = await api.get("/prestamos");
        const misPrestamos = pRes.data.filter(p => p.cod_usuario === usuarioActual.cod_usuario);
        setMisEquipos(misPrestamos);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al sincronizar datos");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formCrear,
        cod_usuario: usuarioActual.cod_usuario,
        cod_estado_mantenimiento: 1,
        fecha_inicio_mantenimiento: new Date().toISOString().split('T')[0],
        hora_recibida: new Date().toTimeString().split(' ')[0],
      };
      await api.post("/mantenimientos", payload);
      toast.success("Solicitud enviada correctamente");
      setFormCrear({ cod_equipo: "", cod_tipo_mantenimiento: "", descripcion_problema: "" });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      toast.error("Error al crear el ticket");
    }
  };

  const handleAceptarTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ticketAceptar,
        cod_estado_mantenimiento: 2,
        fecha_fin_mantenimiento: fechaEntrega
      };
      await api.put(`/mantenimientos/${ticketAceptar.cod_mantenimiento}`, payload);
      toast.success("Ticket aceptado");
      setTicketAceptar(null);
      setFechaEntrega("");
      cargarDatos();
    } catch (err) {
      toast.error("Error al actualizar ticket");
    }
  };

  const handleFinalizarTicket = async (mantenimiento) => {
    if (!confirm("¿Marcar como completado?")) return;
    try {
      const payload = {
        ...mantenimiento,
        cod_estado_mantenimiento: 3,
        hora_retirada: new Date().toTimeString().split(' ')[0]
      };
      await api.put(`/mantenimientos/${mantenimiento.cod_mantenimiento}`, payload);
      toast.success("Mantenimiento finalizado");
      cargarDatos();
    } catch (err) {
      toast.error("Error al finalizar");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este registro permanentemente?")) return;
    try {
      await api.delete("/mantenimientos/" + id);
      toast.success("Registro eliminado");
      cargarDatos();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const stats = useMemo(() => ({
    pendientes: mantenimientos.filter(m => m.cod_estado_mantenimiento === 1).length,
    enProceso: mantenimientos.filter(m => m.cod_estado_mantenimiento === 2).length,
    completados: mantenimientos.filter(m => m.cod_estado_mantenimiento === 3).length,
    total: mantenimientos.length
  }), [mantenimientos]);

  const filteredMantenimientos = useMemo(() => {
    return mantenimientos.filter(m => {
      const matchSearch = (m.nombre_equipo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.nombre_usuario || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.cod_mantenimiento.toString().includes(searchQuery);
      const matchStatus = statusFilter === "" || m.cod_estado_mantenimiento.toString() === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => b.cod_mantenimiento - a.cod_mantenimiento);
  }, [mantenimientos, searchQuery, statusFilter]);

  const renderStatusBadge = (id) => {
    const configs = {
      1: { label: 'Pendiente', color: 'var(--warning)', icon: AlertCircle },
      2: { label: 'En Proceso', color: 'var(--primary)', icon: Clock },
      3: { label: 'Completado', color: 'var(--success)', icon: CheckCircle2 }
    };
    const config = configs[id] || { label: 'Desconocido', color: 'var(--secondary)', icon: AlertCircle };
    const Icon = config.icon;
    
    return (
      <span className="badge" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
        <Icon size={12} /> {config.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Mantenimiento Técnico</h2>
          <p style={{ color: 'var(--text)' }}>Monitorea y gestiona las solicitudes de reparación.</p>
        </div>
        {isDocenteOrDirector && (
          <button onClick={() => setMostrarForm(!mostrarForm)} className="premium-btn premium-btn-primary">
            {mostrarForm ? <X size={18} /> : <Plus size={18} />}
            {mostrarForm ? 'Cerrar Formulario' : 'Nueva Solicitud'}
          </button>
        )}
      </header>

      {/* Mini Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600 }}>Total Tickets</span>
            <FileText size={20} style={{ color: 'var(--primary)', opacity: 0.7 }} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0 0' }}>{stats.total}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600 }}>Pendientes</span>
            <AlertCircle size={20} style={{ color: 'var(--warning)', opacity: 0.7 }} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0 0', color: 'var(--warning)' }}>{stats.pendientes}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600 }}>En Proceso</span>
            <Clock size={20} style={{ color: 'var(--primary)', opacity: 0.7 }} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0 0', color: 'var(--primary)' }}>{stats.enProceso}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="premium-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600 }}>Completados</span>
            <CheckCircle2 size={20} style={{ color: 'var(--success)', opacity: 0.7 }} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0 0', color: 'var(--success)' }}>{stats.completados}</h3>
        </motion.div>
      </div>

      <AnimatePresence>
        {mostrarForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div className="premium-card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} style={{ color: 'var(--primary)' }} /> Detalles de la Solicitud
              </h3>
              <form onSubmit={handleCrearTicket} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Equipo Afectado</label>
                  <select className="premium-input" value={formCrear.cod_equipo} onChange={e => setFormCrear({...formCrear, cod_equipo: e.target.value})} required>
                    <option value="">Seleccione el equipo...</option>
                    {misEquipos.map(e => <option key={e.cod_equipo} value={e.cod_equipo}>{e.nombre_equipo} (ID: {e.cod_equipo})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Tipo de Servicio</label>
                  <select className="premium-input" value={formCrear.cod_tipo_mantenimiento} onChange={e => setFormCrear({...formCrear, cod_tipo_mantenimiento: e.target.value})} required>
                    <option value="">Seleccione tipo...</option>
                    {tipos.map(t => <option key={t.cod_tipo_mantenimiento} value={t.cod_tipo_mantenimiento}>{t.tipo_mantenimiento}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Descripción de la Falla</label>
                  <textarea className="premium-input" rows="3" placeholder="Describe brevemente el problema..." value={formCrear.descripcion_problema} onChange={e => setFormCrear({...formCrear, descripcion_problema: e.target.value})} required />
                </div>
                <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem" }}>
                  <button type="submit" className="premium-btn premium-btn-primary" disabled={misEquipos.length === 0}>
                    Enviar Solicitud
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost">Cancelar</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {ticketAceptar && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ marginBottom: '2.5rem' }}>
            <div className="premium-card" style={{ border: '2px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Aceptar Ticket #{ticketAceptar.cod_mantenimiento}</h3>
                <button onClick={() => setTicketAceptar(null)} className="premium-btn premium-btn-ghost" style={{ padding: '0.25rem' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}><Monitor size={18} /></div>
                  <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>Equipo</p><p style={{ margin: 0, fontWeight: 700 }}>{ticketAceptar.nombre_equipo}</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}><User size={18} /></div>
                  <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>Solicitante</p><p style={{ margin: 0, fontWeight: 700 }}>{ticketAceptar.nombre_usuario}</p></div>
                </div>
              </div>
              <form onSubmit={handleAceptarTicket}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Fecha Prometida de Entrega</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input className="premium-input" type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required />
                  <button type="submit" className="premium-btn premium-btn-primary">Iniciar Mantenimiento <ArrowRight size={18} /></button>
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
            <input type="text" placeholder="Buscar ticket, equipo o usuario..." className="premium-input" style={{ paddingLeft: '3rem' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select className="premium-input" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos los Estados</option>
              <option value="1">Pendientes</option>
              <option value="2">En Proceso</option>
              <option value="3">Completados</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Ticket</th>
                {isAdminOrTecnico && <th>Usuario</th>}
                <th>Equipo</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMantenimientos.map((m, idx) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} key={m.cod_mantenimiento}>
                  <td style={{ color: "var(--primary)", fontWeight: 700 }}>#{m.cod_mantenimiento}</td>
                  {isAdminOrTecnico && <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{m.nombre_usuario || 'S/N'}</td>}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Monitor size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 600 }}>{m.nombre_equipo}</span>
                    </div>
                  </td>
                  <td>{renderStatusBadge(m.cod_estado_mantenimiento)}</td>
                  <td style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} />
                      {m.fecha_inicio_mantenimiento?.split("T")[0]}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: 'flex-end' }}>
                      {isAdminOrTecnico && m.cod_estado_mantenimiento === 1 && (
                        <button onClick={() => setTicketAceptar(m)} className="premium-btn premium-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          Aceptar
                        </button>
                      )}
                      {isAdminOrTecnico && m.cod_estado_mantenimiento === 2 && (
                        <button onClick={() => handleFinalizarTicket(m)} className="premium-btn premium-btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--success)', color: 'white', border: 'none' }}>
                          Finalizar
                        </button>
                      )}
                      <button onClick={() => setTicketDetalles(m)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem' }} title="Detalles">
                        <ChevronRight size={18} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleEliminar(m.cod_mantenimiento)} className="premium-btn premium-btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalles Overlay */}
      <AnimatePresence>
        {ticketDetalles && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTicketDetalles(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="premium-card" style={{ width: '100%', maxWidth: '600px', position: 'relative', zIndex: 101, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Ticket #{ticketDetalles.cod_mantenimiento}</h3>
                <button onClick={() => setTicketDetalles(null)} className="premium-btn premium-btn-ghost" style={{ padding: '0.5rem' }}><X size={20} /></button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <User size={18} style={{ color: 'var(--primary)' }} />
                    <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)' }}>Solicitante</p><p style={{ margin: 0, fontWeight: 700 }}>{ticketDetalles.nombre_usuario}</p></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Monitor size={18} style={{ color: 'var(--primary)' }} />
                    <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)' }}>Equipo</p><p style={{ margin: 0, fontWeight: 700 }}>{ticketDetalles.nombre_equipo}</p></div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)' }}>Entrega Estimada</p><p style={{ margin: 0, fontWeight: 700 }}>{ticketDetalles.fecha_fin_mantenimiento?.split("T")[0] || 'Por definir'}</p></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={18} style={{ color: 'var(--primary)' }} />
                    <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text)' }}>Estado</p><div>{renderStatusBadge(ticketDetalles.cod_estado_mantenimiento)}</div></div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-sec)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>Descripción del Problema</p>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-h)' }}>{ticketDetalles.descripcion_problema || 'No se proporcionó una descripción.'}</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> Recibido: {ticketDetalles.hora_recibida?.slice(0,5) || '--:--'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} /> Retirado: {ticketDetalles.hora_retirada?.slice(0,5) || '--:--'}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Mantenimientos;

import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
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

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form for creating a ticket (Docente/Director)
  const [formCrear, setFormCrear] = useState({
    cod_equipo: "",
    cod_tipo_mantenimiento: "",
    descripcion_problema: "",
  });

  // State for Technician accepting a ticket
  const [ticketAceptar, setTicketAceptar] = useState(null);
  const [fechaEntrega, setFechaEntrega] = useState("");
  
  // State for Details Modal
  const [ticketDetalles, setTicketDetalles] = useState(null);

  const cargarDatos = async () => {
    try {
      const tRes = await api.get("/tipo_mantenimiento");
      setTipos(tRes.data);

      const mRes = await api.get("/mantenimientos");
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
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cod_equipo: formCrear.cod_equipo,
        cod_tipo_mantenimiento: formCrear.cod_tipo_mantenimiento,
        descripcion_problema: formCrear.descripcion_problema,
        cod_usuario: usuarioActual.cod_usuario,
        cod_estado_mantenimiento: 1, // 1 = Pendiente
        fecha_inicio_mantenimiento: new Date().toISOString().split('T')[0],
        hora_recibida: new Date().toTimeString().split(' ')[0], // Hora exacta de creacion
      };
      await api.post("/mantenimientos", payload);
      toast.success("Solicitud de mantenimiento enviada");
      setFormCrear({ cod_equipo: "", cod_tipo_mantenimiento: "", descripcion_problema: "" });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      toast.error("Error al solicitar mantenimiento");
    }
  };

  const handleAceptarTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ticketAceptar,
        cod_estado_mantenimiento: 2, // 2 = En Proceso
        fecha_fin_mantenimiento: fechaEntrega
      };
      await api.put(`/mantenimientos/${ticketAceptar.cod_mantenimiento}`, payload);
      toast.success("Ticket aceptado correctamente");
      setTicketAceptar(null);
      setFechaEntrega("");
      cargarDatos();
    } catch (err) {
      toast.error("Error al aceptar el ticket");
    }
  };

  const handleFinalizarTicket = async (mantenimiento) => {
    if (!confirm("¿Marcar este mantenimiento como completado?")) return;
    try {
      const payload = {
        ...mantenimiento,
        cod_estado_mantenimiento: 3, // 3 = Completado
        hora_retirada: new Date().toTimeString().split(' ')[0]
      };
      await api.put(`/mantenimientos/${mantenimiento.cod_mantenimiento}`, payload);
      toast.success("Mantenimiento finalizado");
      cargarDatos();
    } catch (err) {
      toast.error("Error al finalizar el ticket");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await api.delete("/mantenimientos/" + id);
      toast.success("Registro eliminado");
      cargarDatos();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const renderEstadoBadge = (cod_estado) => {
    switch(cod_estado) {
      case 1: return <span style={{ background: 'var(--warning)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Pendiente</span>;
      case 2: return <span style={{ background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>En Proceso</span>;
      case 3: return <span style={{ background: 'var(--success)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Completado</span>;
      default: return <span style={{ background: 'gray', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Desconocido</span>;
    }
  };

  // Derived state for stats
  const stats = useMemo(() => {
    return {
      pendientes: mantenimientos.filter(m => m.cod_estado_mantenimiento === 1).length,
      enProceso: mantenimientos.filter(m => m.cod_estado_mantenimiento === 2).length,
      completados: mantenimientos.filter(m => m.cod_estado_mantenimiento === 3).length,
      total: mantenimientos.length
    };
  }, [mantenimientos]);

  // Derived state for filtered list
  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter(m => {
      const matchSearch = (m.nombre_equipo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.nombre_usuario || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.cod_mantenimiento.toString().includes(searchQuery);
      const matchStatus = statusFilter === "" || m.cod_estado_mantenimiento.toString() === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => b.cod_mantenimiento - a.cod_mantenimiento);
  }, [mantenimientos, searchQuery, statusFilter]);

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>🔧 Gestión de Mantenimientos</h2>
          {isDocenteOrDirector && (
            <button onClick={() => setMostrarForm(!mostrarForm)} className="premium-btn premium-btn-primary">
              + Solicitar Mantenimiento
            </button>
          )}
        </div>

        {/* Dashboard de Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="premium-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text)' }}>{stats.total}</h3>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-h)', fontSize: '0.9rem' }}>Total Tickets</p>
          </div>
          <div className="premium-card" style={{ textAlign: 'center', padding: '1.5rem 1rem', borderBottom: '4px solid var(--warning)' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--warning)' }}>{stats.pendientes}</h3>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-h)', fontSize: '0.9rem' }}>Pendientes</p>
          </div>
          <div className="premium-card" style={{ textAlign: 'center', padding: '1.5rem 1rem', borderBottom: '4px solid var(--primary)' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>{stats.enProceso}</h3>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-h)', fontSize: '0.9rem' }}>En Proceso</p>
          </div>
          <div className="premium-card" style={{ textAlign: 'center', padding: '1.5rem 1rem', borderBottom: '4px solid var(--success)' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>{stats.completados}</h3>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-h)', fontSize: '0.9rem' }}>Completados</p>
          </div>
        </div>

        {/* Formulario Docente/Director */}
        {mostrarForm && isDocenteOrDirector && (
          <div className="premium-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1.5rem' }}>Nueva Solicitud de Mantenimiento</h3>
            <form onSubmit={handleCrearTicket} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Mi Equipo Asignado</label>
                <select className="premium-input" value={formCrear.cod_equipo} onChange={e => setFormCrear({...formCrear, cod_equipo: e.target.value})} required>
                  <option value="">Seleccione el equipo...</option>
                  {misEquipos.map(e => <option key={e.cod_equipo} value={e.cod_equipo}>{e.nombre_equipo} (Préstamo #{e.cod_prestamo})</option>)}
                </select>
                {misEquipos.length === 0 && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>No tienes equipos asignados actualmente.</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Tipo de Mantenimiento</label>
                <select className="premium-input" value={formCrear.cod_tipo_mantenimiento} onChange={e => setFormCrear({...formCrear, cod_tipo_mantenimiento: e.target.value})} required>
                  <option value="">Seleccione tipo...</option>
                  {tipos.map(t => <option key={t.cod_tipo_mantenimiento} value={t.cod_tipo_mantenimiento}>{t.tipo_mantenimiento}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Descripción del Problema</label>
                <textarea 
                  className="premium-input" 
                  rows="3" 
                  placeholder="Detalla qué le ocurre al equipo..."
                  value={formCrear.descripcion_problema} 
                  onChange={e => setFormCrear({...formCrear, descripcion_problema: e.target.value})} 
                  required
                />
              </div>
              <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                <button type="submit" className="premium-btn premium-btn-primary" disabled={misEquipos.length === 0}>
                  Enviar Ticket
                </button>
                <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de Aceptación Técnico */}
        {ticketAceptar && isAdminOrTecnico && (
          <div className="premium-card" style={{ marginBottom: "2rem", border: '2px solid var(--primary)' }}>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1.5rem' }}>Aceptar Ticket #{ticketAceptar.cod_mantenimiento}</h3>
            <p><strong>Equipo:</strong> {ticketAceptar.nombre_equipo}</p>
            <p><strong>Usuario Solicitante:</strong> {ticketAceptar.nombre_usuario}</p>
            <form onSubmit={handleAceptarTicket} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Fecha Estimada de Entrega (Requerido)</label>
                <input className="premium-input" type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="premium-btn premium-btn-primary">Aceptar e Iniciar Reparación</button>
                <button type="button" onClick={() => setTicketAceptar(null)} className="premium-btn premium-btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de Detalles del Ticket */}
        {ticketDetalles && (
          <div className="premium-card" style={{ marginBottom: "2rem", backgroundColor: "var(--bg-sec)", position: "relative" }}>
            <button onClick={() => setTicketDetalles(null)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text)" }}>✕</button>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1rem' }}>Detalles del Ticket #{ticketDetalles.cod_mantenimiento}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <p style={{ margin: "0.5rem 0" }}><strong>Solicitante:</strong> {ticketDetalles.nombre_usuario}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Equipo:</strong> {ticketDetalles.nombre_equipo}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Estado:</strong> {renderEstadoBadge(ticketDetalles.cod_estado_mantenimiento)}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Fecha Solicitud:</strong> {ticketDetalles.fecha_inicio_mantenimiento?.split("T")[0]}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Hora Recibida:</strong> {ticketDetalles.hora_recibida || 'No registrada'}</p>
              </div>
              <div>
                <p style={{ margin: "0.5rem 0" }}><strong>Fecha Entrega:</strong> {ticketDetalles.fecha_fin_mantenimiento?.split("T")[0] || 'Pendiente'}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Hora Finalizada:</strong> {ticketDetalles.hora_retirada || ticketDetalles.Hora_retirada || 'Pendiente'}</p>
              </div>
            </div>
            <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "8px" }}>
              <strong>Descripción del Problema:</strong>
              <p style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>{ticketDetalles.descripcion_problema || 'Sin descripción detallada.'}</p>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por equipo, usuario o ticket..." 
            className="premium-input" 
            style={{ flex: '1', minWidth: '250px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="premium-input" 
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="1">Pendientes</option>
            <option value="2">En Proceso</option>
            <option value="3">Completados</option>
          </select>
        </div>

        {/* Tabla General */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  {isAdminOrTecnico && <th>Usuario</th>}
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha Solicitud</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientosFiltrados.map((m) => (
                  <tr key={m.cod_mantenimiento}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{m.cod_mantenimiento}</td>
                    {isAdminOrTecnico && <td>{m.nombre_usuario || `ID: ${m.cod_usuario}`}</td>}
                    <td>{m.nombre_equipo || `ID: ${m.cod_equipo}`}</td>
                    <td>{m.nombre_tipo || `ID: ${m.cod_tipo_mantenimiento}`}</td>
                    <td>{renderEstadoBadge(m.cod_estado_mantenimiento)}</td>
                    <td>{m.fecha_inicio_mantenimiento?.split("T")[0]} {m.hora_recibida ? <span style={{fontSize: '0.8rem', color: 'gray'}}>{m.hora_recibida.slice(0,5)}</span> : ''}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setTicketDetalles(m)} className="premium-btn premium-btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                          📄 Detalles
                        </button>
                        
                        {/* Acciones para Tecnicos */}
                        {isAdminOrTecnico && m.cod_estado_mantenimiento === 1 && (
                          <button onClick={() => setTicketAceptar(m)} className="premium-btn premium-btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                            Aceptar
                          </button>
                        )}
                        {isAdminOrTecnico && m.cod_estado_mantenimiento === 2 && (
                          <button onClick={() => handleFinalizarTicket(m)} className="premium-btn premium-btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', backgroundColor: 'var(--success)', color: 'white', border: 'none' }}>
                            ✓ Finalizar
                          </button>
                        )}
                        
                        {/* Eliminar (Solo Admin) */}
                        {isAdmin && (
                          <button onClick={() => handleEliminar(m.cod_mantenimiento)} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {mantenimientosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrTecnico ? 7 : 6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-h)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                      No se encontraron tickets de mantenimiento.
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

export default Mantenimientos;

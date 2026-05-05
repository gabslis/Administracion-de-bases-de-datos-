import { useEffect, useState } from "react";
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

  // Form for creating a ticket (Docente/Director)
  const [formCrear, setFormCrear] = useState({
    cod_equipo: "",
    cod_tipo_mantenimiento: "",
  });

  // State for Technician accepting a ticket
  const [ticketAceptar, setTicketAceptar] = useState(null);
  const [fechaEntrega, setFechaEntrega] = useState("");

  const cargarDatos = async () => {
    try {
      // Cargar tipos de mantenimiento
      const tRes = await api.get("/tipo_mantenimiento");
      setTipos(tRes.data);

      // Cargar mantenimientos
      const mRes = await api.get("/mantenimientos");
      let mData = mRes.data;
      if (isDocenteOrDirector) {
        mData = mData.filter(m => m.cod_usuario === usuarioActual.cod_usuario);
      }
      setMantenimientos(mData);

      // Si es docente/director, cargar sus préstamos (equipos asignados)
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

  // Docente: Crear Ticket
  const handleCrearTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cod_equipo: formCrear.cod_equipo,
        cod_tipo_mantenimiento: formCrear.cod_tipo_mantenimiento,
        cod_usuario: usuarioActual.cod_usuario,
        cod_estado_mantenimiento: 1, // 1 = Pendiente
        fecha_inicio_mantenimiento: new Date().toISOString().split('T')[0],
      };
      await api.post("/mantenimientos", payload);
      toast.success("Solicitud de mantenimiento enviada");
      setFormCrear({ cod_equipo: "", cod_tipo_mantenimiento: "" });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      toast.error("Error al solicitar mantenimiento");
    }
  };

  // Técnico: Aceptar Ticket
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

  // Técnico: Finalizar Ticket
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

  // Helper para renderizar badges de estado
  const renderEstadoBadge = (cod_estado) => {
    switch(cod_estado) {
      case 1: return <span style={{ background: 'var(--warning)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem' }}>Pendiente</span>;
      case 2: return <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem' }}>En Proceso</span>;
      case 3: return <span style={{ background: 'var(--success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem' }}>Completado</span>;
      default: return <span style={{ background: 'gray', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem' }}>Desconocido</span>;
    }
  };

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>🔧 Tickets de Mantenimiento</h2>
          {isDocenteOrDirector && (
            <button onClick={() => setMostrarForm(!mostrarForm)} className="premium-btn premium-btn-primary">
              + Solicitar Mantenimiento
            </button>
          )}
        </div>

        {/* Formulario Docente/Director */}
        {mostrarForm && isDocenteOrDirector && (
          <div className="premium-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1.5rem' }}>Nueva Solicitud de Mantenimiento</h3>
            <form onSubmit={handleCrearTicket} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
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
                  <th>Fecha Entrega</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientos.map((m) => (
                  <tr key={m.cod_mantenimiento}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{m.cod_mantenimiento}</td>
                    {isAdminOrTecnico && <td>{m.nombre_usuario || `ID: ${m.cod_usuario}`}</td>}
                    <td>{m.nombre_equipo || `ID: ${m.cod_equipo}`}</td>
                    <td>{m.nombre_tipo || `ID: ${m.cod_tipo_mantenimiento}`}</td>
                    <td>{renderEstadoBadge(m.cod_estado_mantenimiento)}</td>
                    <td>{m.fecha_inicio_mantenimiento?.split("T")[0]}</td>
                    <td>{m.fecha_fin_mantenimiento?.split("T")[0] || <span style={{color: 'var(--text-h)'}}>Por definir</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {/* Acciones para Tecnicos */}
                        {isAdminOrTecnico && m.cod_estado_mantenimiento === 1 && (
                          <button onClick={() => setTicketAceptar(m)} className="premium-btn premium-btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                            Aceptar Ticket
                          </button>
                        )}
                        {isAdminOrTecnico && m.cod_estado_mantenimiento === 2 && (
                          <button onClick={() => handleFinalizarTicket(m)} className="premium-btn premium-btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', backgroundColor: 'var(--success)', color: 'white', border: 'none' }}>
                            Finalizar
                          </button>
                        )}
                        {/* Eliminar (Solo Admin) */}
                        {isAdmin && (
                          <button onClick={() => handleEliminar(m.cod_mantenimiento)} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                            Eliminar
                          </button>
                        )}
                        {!isAdminOrTecnico && <span style={{ fontSize: '0.85rem', color: 'var(--text-h)' }}>Sin acciones</span>}
                      </div>
                    </td>
                  </tr>
                ))}
                {mantenimientos.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrTecnico ? 8 : 7} style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay tickets de mantenimiento registrados.
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

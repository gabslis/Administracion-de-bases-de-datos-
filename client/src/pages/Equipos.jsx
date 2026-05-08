import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Equipos() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  const vacio = {
    serial: "",
    cod_marca: "",
    nombre_equipo: "",
    cod_estado_equipo: ""
  };

  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [marcasList, setMarcasList] = useState([]);
  const [estadosList, setEstadosList] = useState([]);

  const cargar = async () => {
    try {
      const res = await api.get("/equipos");
      setEquipos(res.data);
    } catch(err) {
      toast.error("Error al cargar equipos");
    }
  };

  const cargarDependencias = async () => {
    try {
      const [marcasRes, estadosRes] = await Promise.all([
        api.get("/marcas"),
        api.get("/estado_equipo")
      ]);
      setMarcasList(marcasRes.data);
      setEstadosList(estadosRes.data);
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
      await api.post("/equipos", form);
      toast.success("Equipo registrado exitosamente");
      setForm(vacio);
      setMostrarForm(false);
      cargar();
    } catch(err) {
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

  const getNombreMarca = (id) => {
    const m = marcasList.find(x => x.cod_marca === id);
    return m ? m.nombre_marca : id;
  };

  const getNombreEstado = (id) => {
    const e = estadosList.find(x => x.cod_estado_equipo === id);
    return e ? e.tipo_estado_equipo : id;
  };

  return (
    <div>
      <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>💻 Inventario de Equipos</h2>
          {isAdminOrTecnico && (
            <button onClick={() => { setForm(vacio); setMostrarForm(!mostrarForm); }}
              className="premium-btn premium-btn-primary">
              + Registrar Equipo
            </button>
          )}
        </div>

        {isAdminOrTecnico && mostrarForm && (
          <div className="premium-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: '1.5rem' }}>
              Nuevo Equipo
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Serial</label>
                <input className="premium-input" type="text" value={form.serial} onChange={e => setForm({...form, serial: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Nombre / Modelo</label>
                <input className="premium-input" type="text" value={form.nombre_equipo} onChange={e => setForm({...form, nombre_equipo: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Marca</label>
                <select className="premium-input" value={form.cod_marca} onChange={e => setForm({...form, cod_marca: e.target.value})} required>
                  <option value="">Seleccione marca...</option>
                  {marcasList.map(m => <option key={m.cod_marca} value={m.cod_marca}>{m.nombre_marca}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Estado</label>
                <select className="premium-input" value={form.cod_estado_equipo} onChange={e => setForm({...form, cod_estado_equipo: e.target.value})} required>
                  <option value="">Seleccione estado...</option>
                  {estadosList.map(e => <option key={e.cod_estado_equipo} value={e.cod_estado_equipo}>{e.tipo_estado_equipo}</option>)}
                </select>
              </div>
              
              <div style={{ gridColumn: "1/-1", display: "flex", gap: "1rem", marginTop: '0.5rem' }}>
                <button type="submit" className="premium-btn premium-btn-primary">
                  Confirmar Registro
                </button>
                <button type="button" onClick={() => setMostrarForm(false)} className="premium-btn premium-btn-ghost" style={{ border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Serial</th>
                  <th>Nombre/Modelo</th>
                  <th>Marca</th>
                  <th>Estado</th>
                  {isAdminOrTecnico && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {equipos.map((e) => (
                  <tr key={e.cod_equipo}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{e.cod_equipo}</td>
                    <td>{e.serial}</td>
                    <td>{e.nombre_equipo}</td>
                    <td>{getNombreMarca(e.cod_marca)}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.8rem', 
                        backgroundColor: e.cod_estado_equipo === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: e.cod_estado_equipo === 1 ? '#15803d' : '#b91c1c'
                      }}>
                        {getNombreEstado(e.cod_estado_equipo)}
                      </span>
                    </td>
                    {isAdminOrTecnico && (
                      <td style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleEliminar(e.cod_equipo)} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {equipos.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrTecnico ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay equipos registrados.
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

export default Equipos;

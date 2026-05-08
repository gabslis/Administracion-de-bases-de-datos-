import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Ubicaciones() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdminOrTecnico = usuarioActual?.cod_rol === 1 || usuarioActual?.cod_rol === 4;

  const [edificios, setEdificios] = useState([]);
  const [aulas, setAulas] = useState([]);

  const [formEdificio, setFormEdificio] = useState({ nombre_edificio: "" });
  const [formAula, setFormAula] = useState({ nombre_aula: "", cod_edificio: "" });

  const cargar = async () => {
    try {
      const [resEd, resAu] = await Promise.all([
        api.get("/edificios"),
        api.get("/aulas")
      ]);
      setEdificios(resEd.data);
      setAulas(resAu.data);
    } catch(err) {
      toast.error("Error al cargar ubicaciones");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleAddEdificio = async (e) => {
    e.preventDefault();
    try {
      await api.post("/edificios", formEdificio);
      toast.success("Edificio añadido");
      setFormEdificio({ nombre_edificio: "" });
      cargar();
    } catch {
      toast.error("Error al añadir edificio");
    }
  };

  const handleAddAula = async (e) => {
    e.preventDefault();
    try {
      await api.post("/aulas", formAula);
      toast.success("Aula añadida");
      setFormAula({ nombre_aula: "", cod_edificio: "" });
      cargar();
    } catch {
      toast.error("Error al añadir aula");
    }
  };

  const handleDeleteEdificio = async (id) => {
    if (!confirm("¿Eliminar edificio? Asegúrate de que no tenga aulas asociadas.")) return;
    try {
      await api.delete("/edificios/" + id);
      toast.success("Edificio eliminado");
      cargar();
    } catch {
      toast.error("Error al eliminar (puede tener aulas asociadas)");
    }
  };

  const handleDeleteAula = async (id) => {
    if (!confirm("¿Eliminar aula?")) return;
    try {
      await api.delete("/aulas/" + id);
      toast.success("Aula eliminada");
      cargar();
    } catch {
      toast.error("Error al eliminar aula");
    }
  };

  const getNombreEdificio = (id) => {
    const ed = edificios.find(x => x.cod_edificio === id);
    return ed ? ed.nombre_edificio : id;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>🏫 Ubicaciones (Edificios y Aulas)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* EDIFICIOS */}
        <div>
          <h3 style={{ color: 'var(--text)' }}>Edificios</h3>
          {isAdminOrTecnico && (
            <div className="premium-card" style={{ marginBottom: "1rem" }}>
              <form onSubmit={handleAddEdificio} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Nombre Edificio</label>
                  <input className="premium-input" type="text" value={formEdificio.nombre_edificio} onChange={e => setFormEdificio({nombre_edificio: e.target.value})} required />
                </div>
                <button type="submit" className="premium-btn premium-btn-primary">Añadir</button>
              </form>
            </div>
          )}
          
          <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Edificio</th>
                  {isAdminOrTecnico && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {edificios.map(ed => (
                  <tr key={ed.cod_edificio}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{ed.cod_edificio}</td>
                    <td>{ed.nombre_edificio}</td>
                    {isAdminOrTecnico && (
                      <td>
                        <button onClick={() => handleDeleteEdificio(ed.cod_edificio)} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Eliminar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AULAS */}
        <div>
          <h3 style={{ color: 'var(--text)' }}>Aulas</h3>
          {isAdminOrTecnico && (
            <div className="premium-card" style={{ marginBottom: "1rem" }}>
              <form onSubmit={handleAddAula} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Edificio</label>
                  <select className="premium-input" value={formAula.cod_edificio} onChange={e => setFormAula({...formAula, cod_edificio: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {edificios.map(ed => <option key={ed.cod_edificio} value={ed.cod_edificio}>{ed.nombre_edificio}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>Nombre Aula</label>
                  <input className="premium-input" type="text" value={formAula.nombre_aula} onChange={e => setFormAula({...formAula, nombre_aula: e.target.value})} required />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%' }}>Añadir Aula</button>
                </div>
              </form>
            </div>
          )}

          <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Aula</th>
                  <th>Edificio</th>
                  {isAdminOrTecnico && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {aulas.map(au => (
                  <tr key={au.cod_aula}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{au.cod_aula}</td>
                    <td>{au.nombre_aula}</td>
                    <td>{getNombreEdificio(au.cod_edificio)}</td>
                    {isAdminOrTecnico && (
                      <td>
                        <button onClick={() => handleDeleteAula(au.cod_aula)} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Eliminar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Ubicaciones;

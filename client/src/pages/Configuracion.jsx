import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const catalogos = [
  { id: 'roles', title: 'Roles de Usuario', endpoint: '/roles', keyId: 'cod_rol', keyName: 'nombre_rol' },
  { id: 'estado_usuario', title: 'Estados de Usuario', endpoint: '/estado_usuario', keyId: 'cod_estado_usuario', keyName: 'tipo_estado_usuario' },
  { id: 'estado_mantenimiento', title: 'Estados de Mantenimiento', endpoint: '/estado_mantenimiento', keyId: 'cod_estado_mantenimiento', keyName: 'tipo_estado_mantenimiento' },
  { id: 'tipo_mantenimiento', title: 'Tipos de Mantenimiento', endpoint: '/tipo_mantenimiento', keyId: 'cod_tipo_mantenimiento', keyName: 'tipo_mantenimiento' },
  { id: 'marcas', title: 'Marcas', endpoint: '/marcas', keyId: 'cod_marca', keyName: 'nombre_marca' },
  { id: 'estado_equipo', title: 'Estados de Equipo', endpoint: '/estado_equipo', keyId: 'cod_estado_equipo', keyName: 'tipo_estado_equipo' },
  { id: 'gravedad_incidencia', title: 'Gravedad de Incidencias', endpoint: '/gravedad_incidencia', keyId: 'cod_gravedad_incidencia', keyName: 'tipo_gravedad_incidencia' },
  { id: 'accesorios', title: 'Accesorios Base', endpoint: '/accesorios', keyId: 'cod_accesorio', keyName: 'nombre_accesorio' },
];

function Configuracion() {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const isAdmin = usuarioActual?.cod_rol === 1;

  const [activeTab, setActiveTab] = useState(catalogos[0]);
  const [data, setData] = useState([]);
  const [nuevoValor, setNuevoValor] = useState("");

  const cargarDatos = async () => {
    try {
      const res = await api.get(activeTab.endpoint);
      setData(res.data);
    } catch (err) {
      toast.error("Error al cargar " + activeTab.title);
    }
  };

  useEffect(() => {
    cargarDatos();
    setNuevoValor("");
  }, [activeTab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nuevoValor.trim()) return;
    try {
      // Para accesorios, hardcodeamos marca 1 por simplicidad en config rápida, o null si la BDD lo permite. 
      // Si falla, el usuario de DB tendrá que asignarlo.
      const payload = { [activeTab.keyName]: nuevoValor };
      if (activeTab.id === 'accesorios') {
        payload.cod_marca = 1; // Default
      }
      
      await api.post(activeTab.endpoint, payload);
      toast.success("Registro añadido");
      setNuevoValor("");
      cargarDatos();
    } catch {
      toast.error("Error al añadir. Puede que falten datos requeridos por la base de datos.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este registro? Podría causar errores si está en uso en el sistema.")) return;
    try {
      await api.delete(`${activeTab.endpoint}/${id}`);
      toast.success("Registro eliminado");
      cargarDatos();
    } catch {
      toast.error("No se puede eliminar porque actualmente está en uso por otros registros.");
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
        <h3>Acceso restringido</h3>
        <p style={{ color: 'var(--text-h)' }}>Solo los <strong>Administradores</strong> pueden modificar la configuración del sistema.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>⚙️ Configuración del Sistema (Catálogos)</h2>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* SIDEBAR TABS */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          {catalogos.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat)}
              className="premium-btn"
              style={{
                textAlign: 'left',
                padding: '0.8rem 1rem',
                background: activeTab.id === cat.id ? 'var(--primary)' : 'white',
                color: activeTab.id === cat.id ? 'white' : 'var(--text)',
                border: activeTab.id === cat.id ? 'none' : '1px solid var(--border)'
              }}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="premium-card" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginTop: 0 }}>Administrar {activeTab.title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-h)', marginBottom: '1.5rem' }}>
            Aquí puedes agregar o eliminar las opciones disponibles para <strong>{activeTab.title}</strong> en todo el sistema.
          </p>
          
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              className="premium-input" 
              value={nuevoValor} 
              onChange={e => setNuevoValor(e.target.value)} 
              placeholder={`Escriba nuevo valor para ${activeTab.title.toLowerCase()}...`}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="premium-btn premium-btn-primary">Añadir</button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre / Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item[activeTab.keyId]}>
                    <td style={{ color: "var(--primary)", fontWeight: 500 }}>#{item[activeTab.keyId]}</td>
                    <td>{item[activeTab.keyName]}</td>
                    <td>
                      <button onClick={() => handleDelete(item[activeTab.keyId])} className="premium-btn premium-btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros disponibles.</td>
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

export default Configuracion;

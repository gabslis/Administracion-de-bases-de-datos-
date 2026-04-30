import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const estiloInput = { width:"100%", padding:"0.6rem", borderRadius:"6px", border:"1px solid #2a2a3e", background:"#0d0d1a", color:"white", boxSizing:"border-box", marginTop:"0.3rem" };
const estiloLabel = { color:"#aaa", fontSize:"0.85rem" };
const vacio = { nombre:"", cod_rol:"", correo:"", password:"", fecha_ingreso:"", cod_estado_usuario:"" };

function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = async () => {
    const res = await api.get("/usuarios");
    setUsuarios(res.data);
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put("/usuarios/" + editId, form);
      } else {
        await api.post("/usuarios", form);
      }
      setForm(vacio);
      setEditId(null);
      setMostrarForm(false);
      cargar();
    } catch(err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEditar = (u) => {
    setForm({ nombre:u.nombre, cod_rol:u.cod_rol, correo:u.correo, password:"", fecha_ingreso:u.fecha_ingreso?.split("T")[0], cod_estado_usuario:u.cod_estado_usuario });
    setEditId(u.cod_usuario);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("Eliminar usuario?")) return;
    try {
      await api.delete("/usuarios/" + id);
      cargar();
    } catch {
      alert("No se puede eliminar: tiene registros asociados");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a1a", fontFamily:"monospace", color:"white" }}>
      <div style={{ background:"#13131f", padding:"1rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #1c1c2e" }}>
        <h2 style={{ color:"#1890ff", margin:0 }}>👥 Usuarios</h2>
        <div style={{ display:"flex", gap:"1rem" }}>
          <button onClick={() => navigate("/dashboard")} style={{ padding:"0.4rem 1rem", background:"#2a2a3e", color:"white", border:"none", borderRadius:"6px", cursor:"pointer" }}>Dashboard</button>
          <button onClick={() => { setForm(vacio); setEditId(null); setMostrarForm(!mostrarForm); }}
            style={{ padding:"0.4rem 1rem", background:"#52c41a", color:"white", border:"none", borderRadius:"6px", cursor:"pointer" }}>
            + Agregar
          </button>
        </div>
      </div>

      <div style={{ padding:"2rem" }}>
        {mostrarForm && (
          <div style={{ background:"#13131f", padding:"1.5rem", borderRadius:"10px", border:"1px solid #1c1c2e", marginBottom:"2rem" }}>
            <h3 style={{ color:"#1890ff", marginTop:0 }}>{editId ? "Editar usuario" : "Nuevo usuario"}</h3>
            <form onSubmit={handleSubmit} style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
              <div><label style={estiloLabel}>Nombre</label><input style={estiloInput} value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} required /></div>
              <div><label style={estiloLabel}>Correo</label><input style={estiloInput} type="email" value={form.correo} onChange={e => setForm({...form, correo:e.target.value})} required /></div>
              <div><label style={estiloLabel}>Password</label><input style={estiloInput} type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} /></div>
              <div><label style={estiloLabel}>Rol (cod)</label><input style={estiloInput} type="number" value={form.cod_rol} onChange={e => setForm({...form, cod_rol:e.target.value})} required /></div>
              <div><label style={estiloLabel}>Fecha ingreso</label><input style={estiloInput} type="date" value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso:e.target.value})} required /></div>
              <div><label style={estiloLabel}>Estado (cod)</label><input style={estiloInput} type="number" value={form.cod_estado_usuario} onChange={e => setForm({...form, cod_estado_usuario:e.target.value})} required /></div>
              <div style={{ gridColumn:"1/-1", display:"flex", gap:"1rem" }}>
                <button type="submit" style={{ padding:"0.6rem 2rem", background:"#1890ff", color:"white", border:"none", borderRadius:"6px", cursor:"pointer" }}>{editId ? "Actualizar" : "Guardar"}</button>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ padding:"0.6rem 2rem", background:"#2a2a3e", color:"white", border:"none", borderRadius:"6px", cursor:"pointer" }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <table style={{ width:"100%", borderCollapse:"collapse", background:"#13131f", borderRadius:"10px", overflow:"hidden" }}>
          <thead>
            <tr style={{ background:"#1c1c2e" }}>
              {["ID","Nombre","Correo","Rol","Fecha Ingreso","Estado","Acciones"].map(h => (
                <th key={h} style={{ padding:"0.75rem 1rem", textAlign:"left", color:"#1890ff", fontSize:"0.85rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.cod_usuario} style={{ borderTop:"1px solid #1c1c2e", background: i%2===0 ? "#13131f" : "#0f0f1a" }}>
                <td style={{ padding:"0.75rem 1rem", color:"#aaa" }}>{u.cod_usuario}</td>
                <td style={{ padding:"0.75rem 1rem" }}>{u.nombre}</td>
                <td style={{ padding:"0.75rem 1rem", color:"#aaa" }}>{u.correo}</td>
                <td style={{ padding:"0.75rem 1rem" }}>{u.cod_rol}</td>
                <td style={{ padding:"0.75rem 1rem", color:"#aaa" }}>{u.fecha_ingreso?.split("T")[0]}</td>
                <td style={{ padding:"0.75rem 1rem" }}>{u.cod_estado_usuario}</td>
                <td style={{ padding:"0.75rem 1rem", display:"flex", gap:"0.5rem" }}>
                  <button onClick={() => handleEditar(u)} style={{ padding:"0.3rem 0.8rem", background:"#faad14", color:"black", border:"none", borderRadius:"4px", cursor:"pointer" }}>Editar</button>
                  <button onClick={() => handleEliminar(u.cod_usuario)} style={{ padding:"0.3rem 0.8rem", background:"#ff4d4f", color:"white", border:"none", borderRadius:"4px", cursor:"pointer" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;
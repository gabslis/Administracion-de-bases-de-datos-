import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/usuarios';
import Prestamos from './pages/Prestamos';
import Mantenimientos from './pages/Mantenimientos';
import Equipos from './pages/Equipos';
import Ubicaciones from './pages/Ubicaciones';
import Incidencias from './pages/Incidencias';
import Sanciones from './pages/Sanciones';
import Configuracion from './pages/Configuracion';
import Layout from './components/Layout';
import RoleRoute from './components/RoleRoute';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* Solo Admin (1) y Técnicos (4) pueden acceder a Usuarios */}
        <Route path="/usuarios" element={
          <PrivateRoute>
            <RoleRoute allowedRoles={[1, 4]}>
              <Usuarios />
            </RoleRoute>
          </PrivateRoute>
        } />
        
        <Route path="/prestamos" element={<PrivateRoute><Prestamos /></PrivateRoute>} />
        <Route path="/mantenimientos" element={<PrivateRoute><Mantenimientos /></PrivateRoute>} />
        <Route path="/equipos" element={<PrivateRoute><Equipos /></PrivateRoute>} />
        <Route path="/ubicaciones" element={<PrivateRoute><Ubicaciones /></PrivateRoute>} />
        <Route path="/incidencias" element={<PrivateRoute><Incidencias /></PrivateRoute>} />
        <Route path="/sanciones" element={<PrivateRoute><Sanciones /></PrivateRoute>} />
        <Route path="/configuracion" element={<PrivateRoute><Configuracion /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
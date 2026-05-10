import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';

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
        
        {/* Solo Admin (1) puede acceder a Usuarios y Configuración */}
        <Route path="/usuarios" element={
          <PrivateRoute>
            <RoleRoute allowedRoles={[1]}>
              <Usuarios />
            </RoleRoute>
          </PrivateRoute>
        } />
        
        <Route path="/configuracion" element={
          <PrivateRoute>
            <RoleRoute allowedRoles={[1]}>
              <Configuracion />
            </RoleRoute>
          </PrivateRoute>
        } />

        {/* Staff (Admin y Técnicos) pueden acceder a Inventario y Ubicaciones */}
        <Route path="/equipos" element={
          <PrivateRoute>
            <RoleRoute allowedRoles={[1, 4]}>
              <Equipos />
            </RoleRoute>
          </PrivateRoute>
        } />

        <Route path="/ubicaciones" element={
          <PrivateRoute>
            <RoleRoute allowedRoles={[1, 4]}>
              <Ubicaciones />
            </RoleRoute>
          </PrivateRoute>
        } />
        
        {/* Abierto a todos los autenticados (el backend filtra los datos) */}
        <Route path="/prestamos" element={<PrivateRoute><Prestamos /></PrivateRoute>} />
        <Route path="/mantenimientos" element={<PrivateRoute><Mantenimientos /></PrivateRoute>} />
        <Route path="/incidencias" element={<PrivateRoute><Incidencias /></PrivateRoute>} />
        <Route path="/sanciones" element={<PrivateRoute><Sanciones /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
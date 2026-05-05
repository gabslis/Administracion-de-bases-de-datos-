import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/usuarios';
import Prestamos from './pages/Prestamos';
import Mantenimientos from './pages/Mantenimientos';
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
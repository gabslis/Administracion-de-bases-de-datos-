import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

function RoleRoute({ children, allowedRoles }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const userRole = usuario ? Number(usuario.cod_rol) : null;
  const hasPermission = userRole !== null && allowedRoles.includes(userRole);


  useEffect(() => {
    if (!hasPermission) {
      toast.error('No tienes permisos para acceder a esta página', { id: 'role-error' });
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;

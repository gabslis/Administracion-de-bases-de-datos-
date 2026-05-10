const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto123', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = Number(req.user.cod_rol);
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
    }
    next();
  };
};


module.exports = { authenticateToken, authorizeRoles };

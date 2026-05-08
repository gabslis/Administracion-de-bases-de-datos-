const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middlewares/error.middleware');

// Routes imports
const authRoutes = require('./routes/auth.routes');
const equipoRoutes = require('./routes/equipo.routes');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');
const prestamoRoutes = require('./routes/prestamo.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const sancionRoutes = require('./routes/sancion.routes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes); // /login -> /auth/login
app.use('/equipos', equipoRoutes);
app.use('/mantenimientos', mantenimientoRoutes);
app.use('/prestamos', prestamoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/incidencias', incidenciaRoutes);
app.use('/sanciones', sancionRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global Error Handler (Must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});


// ══════════════════════════════
// ESTADO MANTENIMIENTO (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/estado_mantenimiento', authenticateToken, authorizeRoles(1), async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_mantenimiento } = req.body;
    const [result] = await conn.query('INSERT INTO estado_mantenimiento (tipo_estado_mantenimiento) VALUES (?)', [tipo_estado_mantenimiento]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/estado_mantenimiento/:id', authenticateToken, authorizeRoles(1), async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_mantenimiento } = req.body;
    await conn.query('UPDATE estado_mantenimiento SET tipo_estado_mantenimiento=? WHERE cod_estado_mantenimiento=?', [tipo_estado_mantenimiento, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/estado_mantenimiento/:id', authenticateToken, authorizeRoles(1), async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM estado_mantenimiento WHERE cod_estado_mantenimiento=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// TIPO MANTENIMIENTO (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/tipo_mantenimiento', authenticateToken, authorizeRoles(1), async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_mantenimiento } = req.body;
    const [result] = await conn.query('INSERT INTO tipo_mantenimiento (tipo_mantenimiento) VALUES (?)', [tipo_mantenimiento]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/tipo_mantenimiento/:id', authenticateToken, authorizeRoles(1), async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_mantenimiento } = req.body;
    await conn.query('UPDATE tipo_mantenimiento SET tipo_mantenimiento=? WHERE cod_tipo_mantenimiento=?', [tipo_mantenimiento, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/tipo_mantenimiento/:id', authenticateToken, authorizeRoles(1), async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM tipo_mantenimiento WHERE cod_tipo_mantenimiento=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// SERVIDOR
// Iniciar servidor en el puerto 3000 porq es el default y ya, no hay ciencia aqui osea de la api, es solo para que se pueda acceder a ella desde el frontend y
//  desde postman y esas cosas, no hay nada raro ni complicado, 
// es lo basico de express para levantar un servidor y escuchar peticiones en un puerto,
//  en este caso el 3000, que es el que se suele usar para desarrollo local, asi que nada raro ni complicado
app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});
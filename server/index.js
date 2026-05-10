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
const ubicacionRoutes = require('./routes/ubicacion.routes');
const catalogoRoutes = require('./routes/catalogo.routes');



const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});


// Routes
app.use('/auth', authRoutes); 
app.use('/equipos', equipoRoutes);
app.use('/mantenimientos', mantenimientoRoutes);
app.use('/prestamos', prestamoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/incidencias', incidenciaRoutes);
app.use('/sanciones', sancionRoutes);
app.use('/ubicaciones', ubicacionRoutes);
app.use('/catalogos', catalogoRoutes);



// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global Error Handler (Must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
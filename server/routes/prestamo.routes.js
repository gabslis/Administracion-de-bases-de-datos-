const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { formatDate, val } = require('../utils/date.utils');

router.get('/', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    let query = `
      SELECT p.*, u.nombre as nombre_usuario, e.nombre_equipo, e.serial as serial_equipo, 
             a.nombre_aula, ed.nombre_edificio, acc.nombre_accesorio
      FROM prestamos p
      LEFT JOIN usuarios u ON p.cod_usuario = u.cod_usuario
      LEFT JOIN equipos e ON p.cod_equipo = e.cod_equipo
      LEFT JOIN aulas a ON p.cod_aula = a.cod_aula
      LEFT JOIN edificios ed ON a.cod_edificio = ed.cod_edificio
      LEFT JOIN accesorios acc ON p.cod_accesorio = acc.cod_accesorio
    `;

    const params = [];
    if (req.user.cod_rol !== 1 && req.user.cod_rol !== 4) {
      query += ' WHERE p.cod_usuario = ?';
      params.push(req.user.cod_usuario);
    }
    const [rows] = await conn.query(query, params);
    console.log(`[DB] Préstamos listados: ${rows.length} registros (User: ${req.user.cod_usuario}, Role: ${req.user.cod_rol})`);
    res.json(rows);
  } catch (err) { 
    console.error('[DB Error] Error en GET /prestamos:', err);
    next(err); 
  }

  finally { conn.release(); }
});

router.post('/', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada } = req.body;
    
    console.log('[DB] Intentando crear préstamo:', { cod_usuario, cod_equipo, cod_aula });

    const [result] = await conn.query(
      `INSERT INTO prestamos 
       (cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cod_usuario, 
        cod_aula, 
        cod_equipo, 
        cod_accesorio || null, 
        formatDate(fecha_salida), 
        formatDate(fecha_devolucion_programada)
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) { 
    console.error('[DB Error] Error en POST /prestamos:', err);
    next(err); 
  }
  finally { conn.release(); }
});


router.put('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada } = req.body;
    await conn.query(
      `UPDATE prestamos SET
       cod_usuario=?, cod_aula=?, cod_equipo=?, cod_accesorio=?, fecha_salida=?, fecha_devolucion_programada=?
       WHERE cod_prestamo=?`,
      [cod_usuario, cod_aula, cod_equipo, cod_accesorio, formatDate(fecha_salida), formatDate(fecha_devolucion_programada), req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM prestamos WHERE cod_prestamo=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

// AULAS, ACCESORIOS, EDIFICIOS
router.get('/aulas', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query(`
      SELECT a.*, e.nombre_edificio 
      FROM aulas a 
      LEFT JOIN edificios e ON a.cod_edificio = e.cod_edificio
    `);
    res.json(rows);

  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/accesorios', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM accesorios');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/edificios', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM edificios');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

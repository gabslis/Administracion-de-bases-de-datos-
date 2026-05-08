const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { formatDate, val } = require('../utils/date.utils');

router.get('/', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    let query = `
      SELECT i.*, g.tipo_gravedad_incidencia, p.cod_usuario
      FROM incidencias i
      LEFT JOIN gravedad_incidencia g ON i.cod_gravedad_incidencia = g.cod_gravedad_incidencia
      LEFT JOIN prestamos p ON i.cod_prestamo = p.cod_prestamo
    `;
    const params = [];
    if (req.user.cod_rol !== 1 && req.user.cod_rol !== 4) {
      query += ' WHERE p.cod_usuario = ?';
      params.push(req.user.cod_usuario);
    }
    const [rows] = await conn.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.post('/', authenticateToken, async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { cod_prestamo, descripcion, fecha_incidencia, cod_gravedad_incidencia } = req.body;
    const [result] = await conn.query(
      'INSERT INTO incidencias (cod_prestamo, descripcion, fecha_incidencia, cod_gravedad_incidencia) VALUES (?, ?, ?, ?)', 
      [cod_prestamo, descripcion, formatDate(fecha_incidencia), cod_gravedad_incidencia]
    );
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.put('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { cod_prestamo, descripcion, fecha_incidencia, cod_gravedad_incidencia } = req.body;
    await conn.query(
      'UPDATE incidencias SET cod_prestamo=?, descripcion=?, fecha_incidencia=?, cod_gravedad_incidencia=? WHERE cod_incidencia=?', 
      [cod_prestamo, descripcion, formatDate(fecha_incidencia), cod_gravedad_incidencia, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM incidencias WHERE cod_incidencia=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/gravedad', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM gravedad_incidencia');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

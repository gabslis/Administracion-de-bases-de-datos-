const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { formatDate, val } = require('../utils/date.utils');

router.get('/', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    let query = `
      SELECT s.*, u.nombre as nombre_usuario, e.nombre_equipo
      FROM sanciones s
      LEFT JOIN usuarios u ON s.cod_usuario = u.cod_usuario
      LEFT JOIN equipos e ON s.cod_equipo = e.cod_equipo
    `;
    const params = [];
    if (req.user.cod_rol !== 1 && req.user.cod_rol !== 4) {
      query += ' WHERE s.cod_usuario = ?';
      params.push(req.user.cod_usuario);
    }
    const [rows] = await conn.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.post('/', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_equipo, motivo, fecha_sancion } = req.body;
    const [result] = await conn.query(
      'INSERT INTO sanciones (cod_usuario, cod_equipo, motivo, fecha_sancion) VALUES (?, ?, ?, ?)',
      [cod_usuario, cod_equipo || null, motivo, formatDate(fecha_sancion)]
    );
    if (cod_equipo) {
      await conn.query('UPDATE equipos SET cod_estado_equipo = 2 WHERE cod_equipo = ?', [cod_equipo]);
    }
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.put('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_equipo, motivo, fecha_sancion } = req.body;
    await conn.query(
      'UPDATE sanciones SET cod_usuario=?, cod_equipo=?, motivo=?, fecha_sancion=? WHERE cod_sancion=?', 
      [cod_usuario, cod_equipo, motivo, formatDate(fecha_sancion), req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const [rows] = await conn.query('SELECT cod_equipo FROM sanciones WHERE cod_sancion = ?', [req.params.id]);
    await conn.query('DELETE FROM sanciones WHERE cod_sancion=?', [req.params.id]);
    if (rows.length > 0 && rows[0].cod_equipo) {
      await conn.query('UPDATE equipos SET cod_estado_equipo = 1 WHERE cod_equipo = ?', [rows[0].cod_equipo]);
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/usuario/:id', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query(
      `SELECT s.*, e.nombre_equipo, e.serial
       FROM sanciones s
       LEFT JOIN equipos e ON s.cod_equipo = e.cod_equipo
       WHERE s.cod_usuario = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

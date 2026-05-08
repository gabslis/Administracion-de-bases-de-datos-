const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { formatDate, val } = require('../utils/date.utils');

router.get('/estados', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM estado_mantenimiento');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/tipos', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM tipo_mantenimiento');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    let query = `
      SELECT m.*, e.nombre_equipo, e.serial, u.nombre as nombre_usuario, 
             tm.tipo_mantenimiento, em.tipo_estado_mantenimiento
      FROM mantenimientos m
      JOIN equipos e ON m.cod_equipo = e.cod_equipo
      JOIN usuarios u ON m.cod_usuario = u.cod_usuario
      JOIN tipo_mantenimiento tm ON m.cod_tipo_mantenimiento = tm.cod_tipo_mantenimiento
      JOIN estado_mantenimiento em ON m.cod_estado_mantenimiento = em.cod_estado_mantenimiento
    `;
    const params = [];
    if (req.user.cod_rol !== 1 && req.user.cod_rol !== 4) {
      query += ' WHERE m.cod_usuario = ?';
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
    const { cod_equipo, cod_tipo_mantenimiento, cod_usuario, cod_estado_mantenimiento,
      fecha_inicio_mantenimiento, hora_recibida, fecha_fin_mantenimiento, hora_retirada, descripcion_problema } = req.body;
      
    const [result] = await conn.query(
      `INSERT INTO mantenimientos 
       (cod_equipo, cod_tipo_mantenimiento, cod_usuario, cod_estado_mantenimiento,
        fecha_inicio_mantenimiento, hora_recibida, fecha_fin_mantenimiento, hora_retirada, descripcion_problema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        val(cod_equipo), val(cod_tipo_mantenimiento), val(cod_usuario), val(cod_estado_mantenimiento),
        formatDate(fecha_inicio_mantenimiento), val(hora_recibida), formatDate(fecha_fin_mantenimiento), val(hora_retirada),
        val(descripcion_problema)
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.put('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    let { cod_equipo, cod_tipo_mantenimiento, cod_usuario, cod_estado_mantenimiento,
      fecha_inicio_mantenimiento, hora_recibida, fecha_fin_mantenimiento, hora_retirada, Hora_retirada, descripcion_problema } = req.body;
      
    const finalHoraRetirada = val(hora_retirada) !== null ? val(hora_retirada) : val(Hora_retirada);

    await conn.query(
      `UPDATE mantenimientos SET
       cod_equipo=?, cod_tipo_mantenimiento=?, cod_usuario=?, cod_estado_mantenimiento=?,
       fecha_inicio_mantenimiento=?, hora_recibida=?, fecha_fin_mantenimiento=?, hora_retirada=?, descripcion_problema=?
       WHERE cod_mantenimiento=?`,
      [
        val(cod_equipo), val(cod_tipo_mantenimiento), val(cod_usuario), val(cod_estado_mantenimiento),
        formatDate(fecha_inicio_mantenimiento), val(hora_recibida), formatDate(fecha_fin_mantenimiento), 
        finalHoraRetirada, val(descripcion_problema), req.params.id
      ]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM mantenimientos WHERE cod_mantenimiento=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

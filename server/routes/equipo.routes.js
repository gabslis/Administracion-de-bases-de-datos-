const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// EQUIPOS
router.get('/', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM equipos');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.post('/', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { serial, cod_marca, nombre_equipo, cod_estado_equipo } = req.body;
    const [result] = await conn.query(
      'INSERT INTO equipos (serial, cod_marca, nombre_equipo, cod_estado_equipo) VALUES (?, ?, ?, ?)',
      [serial, cod_marca, nombre_equipo, cod_estado_equipo]
    );
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.put('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { serial, cod_marca, nombre_equipo, cod_estado_equipo } = req.body;
    await conn.query(
      'UPDATE equipos SET serial=?, cod_marca=?, nombre_equipo=?, cod_estado_equipo=? WHERE cod_equipo=?',
      [serial, cod_marca, nombre_equipo, cod_estado_equipo, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM equipos WHERE cod_equipo=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

// MARCAS
router.get('/marcas', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM marcas');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.post('/marcas', authenticateToken, authorizeRoles(1), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_marca } = req.body;
    const [result] = await conn.query('INSERT INTO marcas (nombre_marca) VALUES (?)', [nombre_marca]);
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

// ESTADO EQUIPO
router.get('/estados', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM estado_equipo');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

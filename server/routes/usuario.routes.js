const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { formatDate, val } = require('../utils/date.utils');

router.get('/', authenticateToken, authorizeRoles(1), async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

// LISTA LITE PARA SELECTORES (Accesible por Técnicos)
router.get('/selector', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT cod_usuario, nombre FROM usuarios WHERE cod_estado_usuario = 1');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.post('/', authenticateToken, authorizeRoles(1), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { nombre, cod_rol, correo, password, fecha_ingreso, cod_estado_usuario } = req.body;
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await conn.query(
      'INSERT INTO usuarios (nombre, cod_rol, correo, contraseña, fecha_ingreso, cod_estado_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, cod_rol, correo, hashedPassword, formatDate(fecha_ingreso), cod_estado_usuario]
    );
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.put('/:id', authenticateToken, authorizeRoles(1), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { nombre, cod_rol, correo, password, fecha_ingreso, cod_estado_usuario } = req.body;
    let query = 'UPDATE usuarios SET nombre=?, cod_rol=?, correo=?, fecha_ingreso=?, cod_estado_usuario=? WHERE cod_usuario=?';
    let params = [nombre, cod_rol, correo, formatDate(fecha_ingreso), cod_estado_usuario, req.params.id];

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query = 'UPDATE usuarios SET nombre=?, cod_rol=?, correo=?, contraseña=?, fecha_ingreso=?, cod_estado_usuario=? WHERE cod_usuario=?';
      params = [nombre, cod_rol, correo, hashedPassword, formatDate(fecha_ingreso), cod_estado_usuario, req.params.id];
    }

    await conn.query(query, params);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/:id', authenticateToken, authorizeRoles(1), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM usuarios WHERE cod_usuario=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/roles', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM roles');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.get('/estados', authenticateToken, async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM estado_usuario');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

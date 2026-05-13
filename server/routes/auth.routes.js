const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getWriteConnection } = require('../db');

// LOGIN
router.post('/login', async (req, res, next) => {
  const { correo, password } = req.body;
  const conn = await getWriteConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // Verificar que el usuario esté activo
    if (usuario.cod_estado_usuario !== 1) {
      return res.status(401).json({ error: 'Usuario inactivo o suspendido, contacte al administrador' });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, usuario.contraseña);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { cod_usuario: usuario.cod_usuario, nombre: usuario.nombre, cod_rol: usuario.cod_rol },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        cod_usuario: usuario.cod_usuario,
        nombre: usuario.nombre,
        cod_rol: usuario.cod_rol
      }
    });
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

// ROLES PÚBLICOS (Para Registro)
router.get('/public-roles', async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM roles WHERE cod_rol IN (2, 3)');
    res.json(rows);
  } catch (err) { next(err); }
  finally { conn.release(); }
});

// REGISTRO PÚBLICO
router.post('/register', async (req, res, next) => {
  const { nombre, correo, password, cod_rol } = req.body;
  const conn = await getWriteConnection();
  try {
    // Validar que solo se registren roles permitidos (2=Director, 3=Docente)
    if (![2, 3].includes(Number(cod_rol))) {
      return res.status(403).json({ error: 'Rol no permitido para registro público' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fecha = new Date().toISOString().split('T')[0];

    const [result] = await conn.query(
      'INSERT INTO usuarios (nombre, cod_rol, correo, contraseña, fecha_ingreso, cod_estado_usuario) VALUES (?, ?, ?, ?, ?, 1)',
      [nombre, cod_rol, correo, hashedPassword, fecha]
    );
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;
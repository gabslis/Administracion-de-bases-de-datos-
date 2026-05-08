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

module.exports = router;

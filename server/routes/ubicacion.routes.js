const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// EDIFICIOS
router.get('/edificios', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM edificios');
    console.log(`[DB] Edificios listados: ${rows.length} registros`);
    res.json(rows);
  } catch (err) { 
    console.error('[DB Error] Error en GET /ubicaciones/edificios:', err);
    next(err); 
  }
  finally { conn.release(); }
});


router.post('/edificios', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_edificio } = req.body;
    const [result] = await conn.query('INSERT INTO edificios (nombre_edificio) VALUES (?)', [nombre_edificio]);
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/edificios/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM edificios WHERE cod_edificio = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

// AULAS
router.get('/aulas', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM aulas');
    console.log(`[DB] Aulas listadas: ${rows.length} registros`);
    res.json(rows);
  } catch (err) { 
    console.error('[DB Error] Error en GET /ubicaciones/aulas:', err);
    next(err); 
  }
  finally { conn.release(); }
});

router.post('/aulas', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_aula, cod_edificio } = req.body;
    const [result] = await conn.query('INSERT INTO aulas (nombre_aula, cod_edificio) VALUES (?, ?)', [nombre_aula, cod_edificio]);
    res.json({ id: result.insertId });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

router.delete('/aulas/:id', authenticateToken, authorizeRoles(1, 4), async (req, res, next) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM aulas WHERE cod_aula = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
  finally { conn.release(); }
});

module.exports = router;

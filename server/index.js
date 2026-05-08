//LA API CFFFFFFF

const express = require('express');
const cors = require('cors');
const { getWriteConnection, getReadConnection } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIN paput
app.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  const conn = await getWriteConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];
    if (password !== usuario.contraseña) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { cod_usuario: usuario.cod_usuario, nombre: usuario.nombre, cod_rol: usuario.cod_rol },
      'secreto123',
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
  } finally {
    conn.release();
  }
});

// EQUIPOS


//obtener equipos ;p
app.get('/equipos', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM equipos');
    res.json(rows);
  } finally { conn.release(); }
});
//crear equipos ;p
app.post('/equipos', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { serial, cod_marca, nombre_equipo, cod_estado_equipo } = req.body;
    const [result] = await conn.query(
      'INSERT INTO equipos (serial, cod_marca, nombre_equipo, cod_estado_equipo) VALUES (?, ?, ?, ?)',
      [serial, cod_marca, nombre_equipo, cod_estado_equipo]
    );
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});

//actualizar equipos kkkkk
app.put('/equipos/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { serial, cod_marca, nombre_equipo, cod_estado_equipo } = req.body;
    await conn.query(
      'UPDATE equipos SET serial=?, cod_marca=?, nombre_equipo=?, cod_estado_equipo=? WHERE cod_equipo=?',
      [serial, cod_marca, nombre_equipo, cod_estado_equipo, req.params.id]
    );
    res.json({ ok: true });
  } finally { conn.release(); }
});
//borrar los equipos :vVVvvvVVvvvVV
app.delete('/equipos/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM equipos WHERE cod_equipo=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});


// MANTENIMIENTOS

//obtener estados y tipos
app.get('/estado_mantenimiento', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM estado_mantenimiento');
    res.json(rows);
  } finally { conn.release(); }
});

app.get('/tipo_mantenimiento', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM tipo_mantenimiento');
    res.json(rows);
  } finally { conn.release(); }
});

//obtener mantenimientos (yo)
app.get('/mantenimientos', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const query = `
      SELECT 
        m.*,
        u.nombre as nombre_usuario,
        e.nombre_equipo, e.serial as serial_equipo,
        em.tipo_estado_mantenimiento as nombre_estado,
        tm.tipo_mantenimiento as nombre_tipo
      FROM mantenimientos m
      LEFT JOIN usuarios u ON m.cod_usuario = u.cod_usuario
      LEFT JOIN equipos e ON m.cod_equipo = e.cod_equipo
      LEFT JOIN estado_mantenimiento em ON m.cod_estado_mantenimiento = em.cod_estado_mantenimiento
      LEFT JOIN tipo_mantenimiento tm ON m.cod_tipo_mantenimiento = tm.cod_tipo_mantenimiento
    `;
    const [rows] = await conn.query(query);
    res.json(rows);
  } finally { conn.release(); }
});
//crear mantenimientos (BRORESPETA)
app.post('/mantenimientos', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_equipo, cod_tipo_mantenimiento, cod_usuario, cod_estado_mantenimiento,
      fecha_inicio_mantenimiento, hora_recibida, fecha_fin_mantenimiento, hora_retirada, descripcion_problema } = req.body;
      
    const val = (v) => v === undefined ? null : v;
    
    const [result] = await conn.query(
      `INSERT INTO mantenimientos 
       (cod_equipo, cod_tipo_mantenimiento, cod_usuario, cod_estado_mantenimiento,
        fecha_inicio_mantenimiento, hora_recibida, fecha_fin_mantenimiento, hora_retirada, descripcion_problema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        val(cod_equipo), 
        val(cod_tipo_mantenimiento), 
        val(cod_usuario), 
        val(cod_estado_mantenimiento),
        val(fecha_inicio_mantenimiento), 
        val(hora_recibida), 
        val(fecha_fin_mantenimiento), 
        val(hora_retirada),
        val(descripcion_problema)
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error("Error creating mantenimiento:", err);
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});
app.put('/mantenimientos/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    let { cod_equipo, cod_tipo_mantenimiento, cod_usuario, cod_estado_mantenimiento,
      fecha_inicio_mantenimiento, hora_recibida, fecha_fin_mantenimiento, hora_retirada, Hora_retirada, descripcion_problema } = req.body;
      
    // mysql2 throws an error if undefined is passed to parameterized query
    // so we fallback to null if undefined
    const val = (v) => v === undefined ? null : v;
    
    // Fix case issue with hora_retirada from the database
    const finalHoraRetirada = val(hora_retirada) !== null ? val(hora_retirada) : val(Hora_retirada);

    // Format dates to YYYY-MM-DD if they are full ISO strings
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    await conn.query(
      `UPDATE mantenimientos SET
       cod_equipo=?, cod_tipo_mantenimiento=?, cod_usuario=?, cod_estado_mantenimiento=?,
       fecha_inicio_mantenimiento=?, hora_recibida=?, fecha_fin_mantenimiento=?, hora_retirada=?, descripcion_problema=?
       WHERE cod_mantenimiento=?`,
      [
        val(cod_equipo), 
        val(cod_tipo_mantenimiento), 
        val(cod_usuario), 
        val(cod_estado_mantenimiento),
        formatDate(fecha_inicio_mantenimiento), 
        val(hora_recibida), 
        formatDate(fecha_fin_mantenimiento), 
        finalHoraRetirada, 
        val(descripcion_problema),
        req.params.id
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Error updating mantenimiento:", err);
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});
//borrar mantenimientos CMAMUT
app.delete('/mantenimientos/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM mantenimientos WHERE cod_mantenimiento=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});


// AULAS Y ACCESORIOS (para selects en prestamos)
app.get('/aulas', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM aulas');
    res.json(rows);
  } finally { conn.release(); }
});

app.get('/accesorios', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM accesorios');
    res.json(rows);
  } finally { conn.release(); }
});

// PRESTAMOS

//obtener prestamos
app.get('/prestamos', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const query = `
      SELECT 
        p.*,
        u.nombre as nombre_usuario,
        e.nombre_equipo, e.serial as serial_equipo,
        a.nombre_aula,
        acc.nombre_accesorio
      FROM prestamos p
      LEFT JOIN usuarios u ON p.cod_usuario = u.cod_usuario
      LEFT JOIN equipos e ON p.cod_equipo = e.cod_equipo
      LEFT JOIN aulas a ON p.cod_aula = a.cod_aula
      LEFT JOIN accesorios acc ON p.cod_accesorio = acc.cod_accesorio
    `;
    const [rows] = await conn.query(query);
    res.json(rows);
  } finally { conn.release(); }
});
//crear prestamos (Ya se entiende no?? digo noma
app.post('/prestamos', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada } = req.body;

    const [result] = await conn.query(
      `INSERT INTO prestamos 
       (cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

//actualizar prestamos (hey hey hey ya no explicare  ya se entiende lo que hace cada cosa
app.put('/prestamos/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada } = req.body;
    await conn.query(
      `UPDATE prestamos SET
       cod_usuario=?, cod_aula=?, cod_equipo=?, cod_accesorio=?, fecha_salida=?, fecha_devolucion_programada=?
       WHERE cod_prestamo=?`,
      [cod_usuario, cod_aula, cod_equipo, cod_accesorio, fecha_salida, fecha_devolucion_programada, req.params.id]
    );
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/prestamos/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM prestamos WHERE cod_prestamo=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});


// ══════════════════════════════
// ROLES
// ══════════════════════════════
app.get('/roles', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM roles');
    res.json(rows);
  } finally { conn.release(); }
});

// USUARIOS
//si
// ══════════════════════════════
// USUARIOS
// ══════════════════════════════
app.get('/usuarios', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM usuarios');
    res.json(rows);
  } finally { conn.release(); }
});

app.post('/usuarios', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre, cod_rol, correo, password, fecha_ingreso, cod_estado_usuario } = req.body;
    const [result] = await conn.query(
      'INSERT INTO usuarios (nombre, cod_rol, correo, contraseña, fecha_ingreso, cod_estado_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, cod_rol, correo, password, fecha_ingreso, cod_estado_usuario]
    );
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});

app.put('/usuarios/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre, cod_rol, correo, password, fecha_ingreso, cod_estado_usuario } = req.body;
    await conn.query(
      'UPDATE usuarios SET nombre=?, cod_rol=?, correo=?, contraseña=?, fecha_ingreso=?, cod_estado_usuario=? WHERE cod_usuario=?',
      [nombre, cod_rol, correo, password, fecha_ingreso, cod_estado_usuario, req.params.id]
    );
    res.json({ ok: true });
  } finally { conn.release(); }
});

app.delete('/usuarios/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM usuarios WHERE cod_usuario=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// MARCAS
// ══════════════════════════════
app.get('/marcas', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM marcas');
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/marcas', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_marca } = req.body;
    const [result] = await conn.query('INSERT INTO marcas (nombre_marca) VALUES (?)', [nombre_marca]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/marcas/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_marca } = req.body;
    await conn.query('UPDATE marcas SET nombre_marca=? WHERE cod_marca=?', [nombre_marca, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/marcas/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM marcas WHERE cod_marca=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// ESTADO EQUIPO
// ══════════════════════════════
app.get('/estado_equipo', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM estado_equipo');
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/estado_equipo', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_equipo } = req.body;
    const [result] = await conn.query('INSERT INTO estado_equipo (tipo_estado_equipo) VALUES (?)', [tipo_estado_equipo]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/estado_equipo/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_equipo } = req.body;
    await conn.query('UPDATE estado_equipo SET tipo_estado_equipo=? WHERE cod_estado_equipo=?', [tipo_estado_equipo, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/estado_equipo/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM estado_equipo WHERE cod_estado_equipo=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// INCIDENCIAS
// ══════════════════════════════
app.get('/incidencias', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const query = `
      SELECT i.*, 
             g.tipo_gravedad_incidencia
      FROM incidencias i
      LEFT JOIN gravedad_incidencia g ON i.cod_gravedad_incidencia = g.cod_gravedad_incidencia
    `;
    const [rows] = await conn.query(query);
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/incidencias', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_prestamo, descripcion, fecha_incidencia, cod_gravedad_incidencia } = req.body;
    
    // Format dates to YYYY-MM-DD
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    const [result] = await conn.query(
      'INSERT INTO incidencias (cod_prestamo, descripcion, fecha_incidencia, cod_gravedad_incidencia) VALUES (?, ?, ?, ?)', 
      [cod_prestamo, descripcion, formatDate(fecha_incidencia), cod_gravedad_incidencia]
    );
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/incidencias/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_prestamo, descripcion, fecha_incidencia, cod_gravedad_incidencia } = req.body;
    
    // Format dates to YYYY-MM-DD
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    await conn.query(
      'UPDATE incidencias SET cod_prestamo=?, descripcion=?, fecha_incidencia=?, cod_gravedad_incidencia=? WHERE cod_incidencia=?', 
      [cod_prestamo, descripcion, formatDate(fecha_incidencia), cod_gravedad_incidencia, req.params.id]
    );
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/incidencias/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM incidencias WHERE cod_incidencia=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// GRAVEDAD INCIDENCIA
// ══════════════════════════════
app.get('/gravedad_incidencia', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM gravedad_incidencia');
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/gravedad_incidencia', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_gravedad_incidencia } = req.body;
    const [result] = await conn.query('INSERT INTO gravedad_incidencia (tipo_gravedad_incidencia) VALUES (?)', [tipo_gravedad_incidencia]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/gravedad_incidencia/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_gravedad_incidencia } = req.body;
    await conn.query('UPDATE gravedad_incidencia SET tipo_gravedad_incidencia=? WHERE cod_gravedad_incidencia=?', [tipo_gravedad_incidencia, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/gravedad_incidencia/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM gravedad_incidencia WHERE cod_gravedad_incidencia=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// SANCIONES
// ══════════════════════════════
app.get('/sanciones', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const query = `
      SELECT s.*, 
             u.nombre as nombre_usuario,
             e.nombre_equipo
      FROM sanciones s
      LEFT JOIN usuarios u ON s.cod_usuario = u.cod_usuario
      LEFT JOIN equipos e ON s.cod_equipo = e.cod_equipo
    `;
    const [rows] = await conn.query(query);
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/sanciones', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_equipo, motivo, fecha_sancion } = req.body;
    
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    const [result] = await conn.query(
      'INSERT INTO sanciones (cod_usuario, cod_equipo, motivo, fecha_sancion) VALUES (?, ?, ?, ?)',
      [cod_usuario, cod_equipo || null, motivo, formatDate(fecha_sancion)]
    );

    // Si la sanción implica un equipo, marcarlo como Inactivo automáticamente
    if (cod_equipo) {
      await conn.query('UPDATE equipos SET cod_estado_equipo = 2 WHERE cod_equipo = ?', [cod_equipo]);
    }

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});
app.put('/sanciones/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_usuario, cod_equipo, motivo, fecha_sancion } = req.body;
    
    // Format dates to YYYY-MM-DD
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr;
    };

    await conn.query('UPDATE sanciones SET cod_usuario=?, cod_equipo=?, motivo=?, fecha_sancion=? WHERE cod_sancion=?', [cod_usuario, cod_equipo, motivo, formatDate(fecha_sancion), req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/sanciones/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    // Obtener el equipo asociado antes de borrar para restaurarlo
    const [rows] = await conn.query('SELECT cod_equipo FROM sanciones WHERE cod_sancion = ?', [req.params.id]);
    
    await conn.query('DELETE FROM sanciones WHERE cod_sancion=?', [req.params.id]);

    // Si la sanción tenía un equipo asociado, restaurarlo a Activo
    if (rows.length > 0 && rows[0].cod_equipo) {
      await conn.query('UPDATE equipos SET cod_estado_equipo = 1 WHERE cod_equipo = ?', [rows[0].cod_equipo]);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

// Consultar sanciones de un usuario específico (para que el docente vea las suyas)
app.get('/sanciones/usuario/:id', async (req, res) => {
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
  } finally { conn.release(); }
});

// ══════════════════════════════
// EDIFICIOS
// ══════════════════════════════
app.get('/edificios', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM edificios');
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/edificios', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_edificio } = req.body;
    const [result] = await conn.query('INSERT INTO edificios (nombre_edificio) VALUES (?)', [nombre_edificio]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/edificios/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_edificio } = req.body;
    await conn.query('UPDATE edificios SET nombre_edificio=? WHERE cod_edificio=?', [nombre_edificio, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/edificios/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM edificios WHERE cod_edificio=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// AULAS (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/aulas', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_aula, cod_edificio } = req.body;
    const [result] = await conn.query('INSERT INTO aulas (nombre_aula, cod_edificio) VALUES (?, ?)', [nombre_aula, cod_edificio]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/aulas/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_aula, cod_edificio } = req.body;
    await conn.query('UPDATE aulas SET nombre_aula=?, cod_edificio=? WHERE cod_aula=?', [nombre_aula, cod_edificio, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/aulas/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM aulas WHERE cod_aula=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// ACCESORIOS (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/accesorios', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_marca, nombre_accesorio } = req.body;
    const [result] = await conn.query('INSERT INTO accesorios (cod_marca, nombre_accesorio) VALUES (?, ?)', [cod_marca, nombre_accesorio]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/accesorios/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { cod_marca, nombre_accesorio } = req.body;
    await conn.query('UPDATE accesorios SET cod_marca=?, nombre_accesorio=? WHERE cod_accesorio=?', [cod_marca, nombre_accesorio, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/accesorios/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM accesorios WHERE cod_accesorio=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// ROLES (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/roles', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_rol } = req.body;
    const [result] = await conn.query('INSERT INTO roles (nombre_rol) VALUES (?)', [nombre_rol]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/roles/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { nombre_rol } = req.body;
    await conn.query('UPDATE roles SET nombre_rol=? WHERE cod_rol=?', [nombre_rol, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/roles/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM roles WHERE cod_rol=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// ESTADO USUARIO
// ══════════════════════════════
app.get('/estado_usuario', async (req, res) => {
  const conn = await getReadConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM estado_usuario');
    res.json(rows);
  } finally { conn.release(); }
});
app.post('/estado_usuario', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_usuario } = req.body;
    const [result] = await conn.query('INSERT INTO estado_usuario (tipo_estado_usuario) VALUES (?)', [tipo_estado_usuario]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/estado_usuario/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_usuario } = req.body;
    await conn.query('UPDATE estado_usuario SET tipo_estado_usuario=? WHERE cod_estado_usuario=?', [tipo_estado_usuario, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/estado_usuario/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM estado_usuario WHERE cod_estado_usuario=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// ESTADO MANTENIMIENTO (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/estado_mantenimiento', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_mantenimiento } = req.body;
    const [result] = await conn.query('INSERT INTO estado_mantenimiento (tipo_estado_mantenimiento) VALUES (?)', [tipo_estado_mantenimiento]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/estado_mantenimiento/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_estado_mantenimiento } = req.body;
    await conn.query('UPDATE estado_mantenimiento SET tipo_estado_mantenimiento=? WHERE cod_estado_mantenimiento=?', [tipo_estado_mantenimiento, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/estado_mantenimiento/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM estado_mantenimiento WHERE cod_estado_mantenimiento=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// ══════════════════════════════
// TIPO MANTENIMIENTO (POST, PUT, DELETE)
// ══════════════════════════════
app.post('/tipo_mantenimiento', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_mantenimiento } = req.body;
    const [result] = await conn.query('INSERT INTO tipo_mantenimiento (tipo_mantenimiento) VALUES (?)', [tipo_mantenimiento]);
    res.json({ id: result.insertId });
  } finally { conn.release(); }
});
app.put('/tipo_mantenimiento/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    const { tipo_mantenimiento } = req.body;
    await conn.query('UPDATE tipo_mantenimiento SET tipo_mantenimiento=? WHERE cod_tipo_mantenimiento=?', [tipo_mantenimiento, req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});
app.delete('/tipo_mantenimiento/:id', async (req, res) => {
  const conn = await getWriteConnection();
  try {
    await conn.query('DELETE FROM tipo_mantenimiento WHERE cod_tipo_mantenimiento=?', [req.params.id]);
    res.json({ ok: true });
  } finally { conn.release(); }
});

// SERVIDOR
// Iniciar servidor en el puerto 3000 porq es el default y ya, no hay ciencia aqui osea de la api, es solo para que se pueda acceder a ella desde el frontend y
//  desde postman y esas cosas, no hay nada raro ni complicado, 
// es lo basico de express para levantar un servidor y escuchar peticiones en un puerto,
//  en este caso el 3000, que es el que se suele usar para desarrollo local, asi que nada raro ni complicado
app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});
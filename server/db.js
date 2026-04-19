const mysql = require('mysql2/promise');
require('dotenv').config();

// ── INSTANCIAS ──
const instances = {
  primary: {
    host: process.env.DB_HOST_PRIMARY,
    port: process.env.DB_PORT_PRIMARY,
  },
  mirror: {
    host: process.env.DB_HOST_MIRROR,
    port: process.env.DB_PORT_MIRROR,
  },
  arbiter: {
    host: process.env.DB_HOST_ARBITER,
    port: process.env.DB_PORT_ARBITER,
  },
};

// ── CREDENCIALES ──
const credentials = {
  admin: {
    user:     process.env.DB_USER_ADMIN,
    password: process.env.DB_PASS_ADMIN,
  },
  consulta: {
    user:     process.env.DB_USER_CONSULTA,
    password: process.env.DB_PASS_CONSULTA,
  },
};

// ── CREAR POOL ──
function createPool(instance, role) {
  return mysql.createPool({
    host:             instances[instance].host,
    port:             instances[instance].port,
    database:         process.env.DB_NAME,
    user:             credentials[role].user,
    password:         credentials[role].password,
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0,
  });
}

// ── POOLS INICIALES ──
let writePool = createPool('primary', 'admin');    // Escrituras → PRIMARY:3306
let readPool  = createPool('mirror',  'consulta'); // Lecturas   → ESPEJO:3307

// ── CONEXIÓN DE ESCRITURA CON FAILOVER ──
async function getWriteConnection() {
  try {
    const conn = await writePool.getConnection();
    console.log('✅ Escritura conectada a PRIMARY 3306');
    return conn;
  } catch (err) {
    console.warn('⚠️  PRIMARY caído, intentando ESPEJO 3307...', err.message);
    try {
      writePool = createPool('mirror', 'admin');
      const conn = await writePool.getConnection();
      console.log('✅ Escritura conectada a ESPEJO 3307');
      return conn;
    } catch (err2) {
      console.error('❌ ESPEJO también falló:', err2.message);
      throw new Error('No hay instancias de escritura disponibles');
    }
  }
}

// ── CONEXIÓN DE LECTURA CON FAILOVER ──
async function getReadConnection() {
  try {
    const conn = await readPool.getConnection();
    console.log('✅ Lectura conectada a ESPEJO 3307');
    return conn;
  } catch (err) {
    console.warn('⚠️  ESPEJO caído, intentando PRIMARY 3306...', err.message);
    try {
      readPool = createPool('primary', 'consulta');
      const conn = await readPool.getConnection();
      console.log('✅ Lectura conectada a PRIMARY 3306');
      return conn;
    } catch (err2) {
      console.error('❌ PRIMARY también falló:', err2.message);
      throw new Error('No hay instancias de lectura disponibles');
    }
  }
}

module.exports = { getWriteConnection, getReadConnection };
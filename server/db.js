const mysql = require('mysql2/promise');
require('dotenv').config();

const instances = {
  primary: {
    host: process.env.DB_HOST_PRIMARY || '127.0.0.1',
    port: process.env.DB_PORT_PRIMARY || 3306,
  },
  mirror: {
    host: process.env.DB_HOST_MIRROR || process.env.DB_HOST_PRIMARY || '127.0.0.1',
    port: process.env.DB_PORT_MIRROR || process.env.DB_PORT_PRIMARY || 3306,
  },
  arbiter: {
    host: process.env.DB_HOST_ARBITER || process.env.DB_HOST_PRIMARY || '127.0.0.1',
    port: process.env.DB_PORT_ARBITER || process.env.DB_PORT_PRIMARY || 3306,
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
    console.log(`✅ Escritura conectada a ${instances.primary.host}:${instances.primary.port}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️  FALLO en ${instances.primary.host}:${instances.primary.port}, intentando alternativa...`, err.message);
    try {
      writePool = createPool('mirror', 'admin');
      const conn = await writePool.getConnection();
      console.log(`✅ Escritura conectada a EMERGENCIA ${instances.mirror.host}:${instances.mirror.port}`);
      return conn;
    } catch (err2) {
      console.error('❌ Todas las instancias de escritura fallaron:', err2.message);
      throw new Error('No hay instancias de escritura disponibles');
    }
  }
}

async function getReadConnection() {
  try {
    const conn = await readPool.getConnection();
    console.log(`✅ Lectura conectada a ${instances.mirror.host}:${instances.mirror.port}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️  FALLO en ${instances.mirror.host}:${instances.mirror.port}, intentando alternativa...`, err.message);
    try {
      readPool = createPool('primary', 'consulta');
      const conn = await readPool.getConnection();
      console.log(`✅ Lectura conectada a EMERGENCIA ${instances.primary.host}:${instances.primary.port}`);
      return conn;
    } catch (err2) {
      console.error('❌ Todas las instancias de lectura fallaron:', err2.message);
      throw new Error('No hay instancias de lectura disponibles');
    }
  }
}


module.exports = { getWriteConnection, getReadConnection };
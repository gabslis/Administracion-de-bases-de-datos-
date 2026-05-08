const bcrypt = require('bcryptjs');
const { getWriteConnection } = require('./db');

async function migrate() {
  console.log('--- Iniciando migración de contraseñas a Bcrypt ---');
  const conn = await getWriteConnection();
  try {
    const [usuarios] = await conn.query('SELECT cod_usuario, contraseña FROM usuarios');
    console.log(`Encontrados ${usuarios.length} usuarios.`);

    for (const user of usuarios) {
      if (!user.contraseña || user.contraseña.startsWith('$2a$')) {
        console.log(`Usuario ${user.cod_usuario} ya está hasheado o tiene contraseña nula. Saltando.`);
        continue;
      }

      console.log(`Hasheando contraseña para usuario ${user.cod_usuario}...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.contraseña, salt);

      await conn.query('UPDATE usuarios SET contraseña = ? WHERE cod_usuario = ?', [hashedPassword, user.cod_usuario]);
    }

    console.log('--- Migración completada con éxito ---');
  } catch (err) {
    console.error('Error durante la migración:', err);
  } finally {
    conn.release();
    process.exit();
  }
}

migrate();

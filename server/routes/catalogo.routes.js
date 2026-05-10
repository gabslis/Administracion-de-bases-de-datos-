const express = require('express');
const router = express.Router();
const { getWriteConnection, getReadConnection } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Helper to create CRUD for a catalog table
const createCatalogRoutes = (tableName, idCol, nameCol) => {
  // GET
  router.get(`/${tableName}`, authenticateToken, async (req, res, next) => {
    const conn = await getReadConnection();
    try {
      const [rows] = await conn.query(`SELECT * FROM ${tableName}`);
      res.json(rows);
    } catch (err) { next(err); }
    finally { conn.release(); }
  });

  // POST
  router.post(`/${tableName}`, authenticateToken, authorizeRoles(1), async (req, res, next) => {
    const conn = await getWriteConnection();
    try {
      const payload = req.body;
      const value = payload[nameCol];

      if (!value || value.toString().trim() === "") {
        return res.status(400).json({ error: `El campo ${nameCol} es obligatorio.` });
      }

      const [result] = await conn.query(`INSERT INTO ${tableName} SET ?`, [payload]);
      res.json({ id: result.insertId });
    } catch (err) { next(err); }
    finally { conn.release(); }
  });

  // DELETE
  router.delete(`/${tableName}/:id`, authenticateToken, authorizeRoles(1), async (req, res, next) => {
    const conn = await getWriteConnection();
    try {
      await conn.query(`DELETE FROM ${tableName} WHERE ${idCol} = ?`, [req.params.id]);
      res.json({ ok: true });
    } catch (err) { next(err); }
    finally { conn.release(); }
  });
};

// Define catalogs
createCatalogRoutes('roles', 'cod_rol', 'nombre_rol');
createCatalogRoutes('estado_usuario', 'cod_estado_usuario', 'tipo_estado_usuario');
createCatalogRoutes('estado_mantenimiento', 'cod_estado_mantenimiento', 'tipo_estado_mantenimiento');
createCatalogRoutes('tipo_mantenimiento', 'cod_tipo_mantenimiento', 'tipo_mantenimiento');
createCatalogRoutes('marcas', 'cod_marca', 'nombre_marca');
createCatalogRoutes('estado_equipo', 'cod_estado_equipo', 'tipo_estado_equipo');
createCatalogRoutes('gravedad_incidencia', 'cod_gravedad_incidencia', 'tipo_gravedad_incidencia');
createCatalogRoutes('accesorios', 'cod_accesorio', 'nombre_accesorio');

module.exports = router;

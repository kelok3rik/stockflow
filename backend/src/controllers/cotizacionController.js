import pool from "../database/db.js";

// =========================
// Crear Cotización
// =========================
export const crearCotizacion = async (req, res) => {
  const { cliente_id, usuario_id, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: "Debe agregar al menos un producto" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Crear cabecera con total 0 temporal
    const result = await client.query(
      `INSERT INTO cotizacion(cliente_id, usuario_id, total)
       VALUES ($1, $2, 0)
       RETURNING id_cotizaciones`,
      [cliente_id, usuario_id]
    );

    const cotizacionId = result.rows[0].id_cotizaciones;

    // 2. Insertar detalles
    const values = detalles.map(d => [cotizacionId, d.producto_id, d.cantidad, d.precio]);
    for (let item of values) {
      await client.query(
        `INSERT INTO cotizacion_detalle (cotizacion_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        item
      );
    }

    // 3. Calcular total
    const totalResult = await client.query(
      `SELECT SUM(cantidad * precio_unitario) AS total
       FROM cotizacion_detalle
       WHERE cotizacion_id = $1 AND activo = TRUE`,
      [cotizacionId]
    );

    await client.query(
      `UPDATE cotizacion SET total = $1 WHERE id_cotizaciones = $2`,
      [totalResult.rows[0].total || 0, cotizacionId]
    );

    await client.query("COMMIT");

    res.json({ message: "Cotización creada correctamente", cotizacionId });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// =========================
// Listar Cotizaciones con detalle
// =========================
export const listarCotizaciones = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id_cotizaciones,
        c.fecha,
        c.total,
        cl.nombre AS cliente,
        cd.id_cotizacion_detalle,
        p.id_productos,
        p.nombre AS producto,
        cd.cantidad,
        cd.precio_unitario,
        (cd.cantidad * cd.precio_unitario) AS subtotal
      FROM cotizacion c
      JOIN cliente cl ON c.cliente_id = cl.id_clientes
      JOIN cotizacion_detalle cd ON cd.cotizacion_id = c.id_cotizaciones AND cd.activo = TRUE
      JOIN producto p ON cd.producto_id = p.id_productos
      WHERE c.activo = TRUE
      ORDER BY c.fecha DESC, c.id_cotizaciones, cd.id_cotizacion_detalle`
    );

    // Agrupar por cotización
    const cotizacionesMap = new Map();

    result.rows.forEach(row => {
      const id = row.id_cotizaciones;
      if (!cotizacionesMap.has(id)) {
        cotizacionesMap.set(id, {
          id_cotizaciones: row.id_cotizaciones,
          fecha: row.fecha,
          total: row.total,
          cliente: row.cliente,
          detalles: []
        });
      }
      cotizacionesMap.get(id).detalles.push({
        id_cotizacion_detalle: row.id_cotizacion_detalle,
        id_productos: row.id_productos,
        producto: row.producto,
        cantidad: row.cantidad,
        precio_unitario: row.precio_unitario,
        subtotal: row.subtotal
      });
    });

    res.json(Array.from(cotizacionesMap.values()));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// Obtener cotización por ID
// =========================
export const obtenerCotizacion = async (req, res) => {
  const { id } = req.params;

  try {
    const cabecera = await pool.query(
      `SELECT c.*, cl.nombre AS cliente
       FROM cotizacion c
       JOIN cliente cl ON c.cliente_id = cl.id_clientes
       WHERE c.id_cotizaciones = $1`,
      [id]
    );

    const detalle = await pool.query(
      `SELECT cd.*, p.nombre
       FROM cotizacion_detalle cd
       JOIN producto p ON cd.producto_id = p.id_productos
       WHERE cd.cotizacion_id = $1 AND cd.activo = TRUE`,
      [id]
    );

    if (cabecera.rows.length === 0) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    res.json({
      ...cabecera.rows[0],
      detalles: detalle.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// Editar cotización
// =========================
export const editarCotizacion = async (req, res) => {
  const { id } = req.params;
  const { cliente_id, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: "Debe agregar al menos un producto" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Actualizar cliente
    await client.query(
      `UPDATE cotizacion SET cliente_id = $1 WHERE id_cotizaciones = $2`,
      [cliente_id, id]
    );

    // Desactivar detalles anteriores
    await client.query(
      `UPDATE cotizacion_detalle SET activo = FALSE WHERE cotizacion_id = $1`,
      [id]
    );

    // Insertar nuevos detalles
    for (let item of detalles) {
      await client.query(
        `INSERT INTO cotizacion_detalle (cotizacion_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [id, item.producto_id, item.cantidad, item.precio]
      );
    }

    // Recalcular total
    const totalResult = await client.query(
      `SELECT SUM(cantidad * precio_unitario) AS total
       FROM cotizacion_detalle
       WHERE cotizacion_id = $1 AND activo = TRUE`,
      [id]
    );

    await client.query(
      `UPDATE cotizacion SET total = $1 WHERE id_cotizaciones = $2`,
      [totalResult.rows[0].total || 0, id]
    );

    await client.query("COMMIT");

    res.json({ message: "Cotización actualizada" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// =========================
// Cancelar cotización
// =========================
export const cancelarCotizacion = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE cotizacion SET activo = FALSE WHERE id_cotizaciones = $1`,
      [id]
    );

    res.json({ message: "Cotización cancelada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

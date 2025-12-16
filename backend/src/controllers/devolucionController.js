import pool from "../database/db.js";

export const getFacturaDetalles = async (req, res) => {
  const { factura_id } = req.params;

  if (!factura_id) {
    return res.status(400).json({ message: "Factura no especificada." });
  }

  try {
    const result = await pool.query(`
      SELECT 
        fd.id_factura_detalle,
        fd.producto_id,
        p.nombre AS producto,
        fd.cantidad,
        fd.precio_unitario,
        (fd.cantidad * fd.precio_unitario) AS subtotal
      FROM factura_detalle fd
      JOIN producto p ON fd.producto_id = p.id_productos
      WHERE fd.factura_id = $1
    `, [factura_id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createDevolucion = async (req, res) => {
  const client = await pool.connect();

  try {
    const { factura_id, usuario_id, detalles = [], referencia = "" } = req.body;

    if (!factura_id || !usuario_id || detalles.length === 0) {
      return res.status(400).json({ message: "Datos incompletos para la devolución." });
    }

    await client.query("BEGIN");

    const movNumResult = await client.query(`
      SELECT COALESCE(MAX(id_movimientos_inventario), 0) + 1 AS next_num
      FROM movimiento_inventario
    `);
    const numeroMovimiento = "DEV-" + String(movNumResult.rows[0].next_num).padStart(6, "0");

    const movimientoResult = await client.query(`
      INSERT INTO movimiento_inventario 
      (numero_documento, tipo_movimiento_id, usuario_id, fecha, referencia, activo)
      VALUES ($1, 1, $2, NOW(), $3, true)
      RETURNING id_movimientos_inventario
    `, [numeroMovimiento, usuario_id, `DEVOLUCION FACTURA ${factura_id}`]);

    const movimiento_id = movimientoResult.rows[0].id_movimientos_inventario;

    // Calcular total devuelto
    let totalDevuelto = 0;
    for (const item of detalles) {
      const { factura_detalle_id, producto_id, cantidad, precio_unitario } = item;

      if (!factura_detalle_id || !producto_id || Number(cantidad) <= 0) {
        throw new Error("Detalle inválido en la devolución.");
      }

      totalDevuelto += Number(cantidad) * Number(precio_unitario || 0);

      await client.query(`
        INSERT INTO movimiento_inventario_detalle
        (movimiento_inventario_id, producto_id, cantidad, costo_unitario, activo)
        VALUES ($1, $2, $3, 0, true)
      `, [movimiento_id, producto_id, cantidad]);

      await client.query(`
        UPDATE producto
        SET stock = COALESCE(stock,0) + $1
        WHERE id_productos = $2
      `, [cantidad, producto_id]);
    }

    // Insertar en tabla devolucion
    const devolucionResult = await client.query(`
      INSERT INTO devolucion
      (numero_documento, factura_id, usuario_id, fecha, total, activo)
      VALUES ($1, $2, $3, NOW(), $4, true)
      RETURNING id_devoluciones
    `, [numeroMovimiento, factura_id, usuario_id, totalDevuelto]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Devolución registrada correctamente.",
      movimiento_id,
      devolucion_id: devolucionResult.rows[0].id_devoluciones,
      numero_documento: numeroMovimiento,
      totalDevuelto
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const getDevoluciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
  d.id_devoluciones,
  d.numero_documento,
  d.fecha,
  d.total,
  d.factura_id,

  u.nombre AS usuario,

  COALESCE(
    json_agg(
      json_build_object(
        'detalle_id', mid.id_movi_invd,
        'producto_id', p.id_productos,
        'producto', p.nombre,
        'cantidad', mid.cantidad,
        'precio_unitario', fd.precio_unitario,
        'subtotal', mid.cantidad * fd.precio_unitario
      )
      ORDER BY mid.id_movi_invd
    ) FILTER (WHERE mid.id_movi_invd IS NOT NULL),
    '[]'
  ) AS detalles

FROM devolucion d

JOIN usuario u
  ON u.id_usuarios = d.usuario_id

JOIN movimiento_inventario mi
  ON mi.numero_documento = d.numero_documento

LEFT JOIN movimiento_inventario_detalle mid
  ON mid.movimiento_inventario_id = mi.id_movimientos_inventario
 AND mid.activo = true

LEFT JOIN producto p
  ON p.id_productos = mid.producto_id

LEFT JOIN factura_detalle fd
  ON fd.factura_id = d.factura_id
 AND fd.producto_id = mid.producto_id

WHERE d.activo = true

GROUP BY
  d.id_devoluciones,
  u.nombre

ORDER BY d.fecha DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error en getDevoluciones:", error);
    res.status(500).json({ message: error.message });
  }
};



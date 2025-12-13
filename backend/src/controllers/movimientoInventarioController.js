// controllers/movimientoInventarioController.js

import pool from "../database/db.js";

export const createAjusteInventario = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      usuario_id,
      tipo_movimiento_id, // 1 = entrada, 2 = salida
      referencia,
      detalles = []
    } = req.body;

    console.log("Datos recibidos para ajuste:", req.body);

    if (!usuario_id || !tipo_movimiento_id || detalles.length === 0) {
      return res.status(400).json({ message: "Faltan datos requeridos o detalles vacíos." });
    }

    await client.query("BEGIN");

    // 1. Número correlativo
    const numeroResult = await client.query(
      `SELECT COALESCE(MAX(numero_documento::integer), 0) + 1 AS next_num 
       FROM movimientos_inventario`
    );

    const numeroDoc = String(numeroResult.rows[0].next_num).padStart(6, "0");

    // 2. Insertar movimiento principal
    const movResult = await client.query(
      `INSERT INTO movimientos_inventario
       (numero_documento, tipo_movimiento_id, usuario_id, fecha, referencia, activo)
       VALUES ($1, $2, $3, NOW(), $4, true)
       RETURNING id_movimientos_inventario`,
      [numeroDoc, tipo_movimiento_id, usuario_id, referencia]
    );

    const movimiento_id = movResult.rows[0].id_movimientos_inventario;

    // 3. Procesar cada item
    for (const item of detalles) {
      const producto_id = item.producto_id;
      const cantidad = Number(item.cantidad);

      if (!producto_id || cantidad <= 0) {
        throw new Error("Detalle inválido: producto_id y cantidad > 0 requeridos.");
      }

      // DETALLE
      await client.query(
        `INSERT INTO movimiento_inventario_detalle
         (movimiento_inventario_id, producto_id, cantidad, costo_unitario, activo)
         VALUES ($1, $2, $3, 0, true)`,
        [
          movimiento_id,
          producto_id,
          tipo_movimiento_id === 1 ? cantidad : cantidad * -1
        ]
      );

      // STOCK
      await client.query(
        `UPDATE producto
         SET stock = COALESCE(stock,0) + $1
         WHERE id_productos = $2`,
        [
          tipo_movimiento_id === 1 ? cantidad : cantidad * -1,
          producto_id
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Ajuste de inventario registrado exitosamente.",
      movimiento_id,
      numero_documento: numeroDoc
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

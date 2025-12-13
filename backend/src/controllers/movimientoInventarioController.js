// controllers/movimientoInventarioController.js
import pool from "../database/db.js";

export const createAjusteInventario = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      usuario_id,
      tipo_movimiento_id, // 3 = AJUSTE_POS | 4 = AJUSTE_NEG
      referencia,
      detalles = []
    } = req.body;

    if (!usuario_id || !tipo_movimiento_id || detalles.length === 0) {
      return res.status(400).json({
        message: "Faltan datos requeridos o detalles vacíos."
      });
    }

    await client.query("BEGIN");

    // ===============================
    // 1. OBTENER CORRELATIVO SEGURO
    // ===============================
    const seqRes = await client.query(
      `SELECT nextval('seq_movimiento_inventario') AS next_num`
    );

    const correlativo = seqRes.rows[0].next_num;
    const numeroDocumento = `AJU-${String(correlativo).padStart(6, "0")}`;

    // ===============================
    // 2. INSERTAR MOVIMIENTO
    // ===============================
    const movResult = await client.query(
      `
      INSERT INTO movimiento_inventario
        (numero_documento, tipo_movimiento_id, usuario_id, fecha, referencia, activo)
      VALUES
        ($1, $2, $3, NOW(), $4, true)
      RETURNING id_movimientos_inventario
      `,
      [numeroDocumento, tipo_movimiento_id, usuario_id, referencia]
    );

    const movimiento_id = movResult.rows[0].id_movimientos_inventario;

    // ===============================
    // 3. DETALLES + STOCK
    // ===============================
    for (const item of detalles) {
      const producto_id = Number(item.producto_id);
      const cantidad = Number(item.cantidad);

      if (!producto_id || cantidad <= 0) {
        throw new Error("Detalle inválido.");
      }

      const factor = tipo_movimiento_id === 3 ? 1 : -1;
      const cantidadFinal = cantidad * factor;

      // DETALLE
      await client.query(
        `
        INSERT INTO movimiento_inventario_detalle
          (movimiento_inventario_id, producto_id, cantidad, activo)
        VALUES
          ($1, $2, $3, true)
        `,
        [movimiento_id, producto_id, cantidadFinal]
      );

      // STOCK
      await client.query(
        `
        UPDATE producto
        SET stock = COALESCE(stock, 0) + $1
        WHERE id_productos = $2
        `,
        [cantidadFinal, producto_id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Ajuste de inventario registrado correctamente.",
      movimiento_id,
      numero_documento: numeroDocumento
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error ajuste inventario:", error);
    res.status(500).json({
      message: "Error registrando ajuste de inventario."
    });
  } finally {
    client.release();
  }
};

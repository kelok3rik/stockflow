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

export const getAllMovimientosInventario = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        mi.id_movimientos_inventario,
        mi.numero_documento,
        mi.fecha,
        mi.referencia,
        mi.activo,

        tm.id_tipos_movimiento,
        tm.descripcion AS tipo_movimiento,

        u.id_usuarios,
        u.nombre AS usuario,

        COALESCE(
          json_agg(
            json_build_object(
              'producto_id', p.id_productos,
              'producto', p.nombre,
              'cantidad', mid.cantidad,
              'tipo',
                CASE
                  WHEN mid.cantidad > 0 THEN 'ENTRADA'
                  ELSE 'SALIDA'
                END
            )
          ) FILTER (WHERE mid.producto_id IS NOT NULL),
          '[]'::json
        ) AS detalles

      FROM movimiento_inventario mi
      INNER JOIN tipo_movimiento tm
        ON tm.id_tipos_movimiento = mi.tipo_movimiento_id
      INNER JOIN usuario u
        ON u.id_usuarios = mi.usuario_id
      LEFT JOIN movimiento_inventario_detalle mid
        ON mid.movimiento_inventario_id = mi.id_movimientos_inventario
        AND mid.activo = true
      LEFT JOIN producto p
        ON p.id_productos = mid.producto_id

      WHERE mi.activo = true

      GROUP BY
        mi.id_movimientos_inventario,
        tm.id_tipos_movimiento,
        tm.descripcion,
        u.id_usuarios,
        u.nombre

      ORDER BY mi.fecha DESC, mi.id_movimientos_inventario DESC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    res.status(500).json({
      message: "Error obteniendo los movimientos de inventario"
    });
  }
};



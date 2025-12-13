// controllers/compraController.js
import pool from '../database/db.js'; // tu pool de pg

function calcularTotal(detalles) {
  return detalles.reduce((acc, d) => {
    const cantidad = Number(d.cantidad || 0);
    const costo = Number(d.costo_unitario || 0);
    return acc + cantidad * costo;
  }, 0);
}

export const createCompra = async (req, res) => {
  const client = await pool.connect();

  try {
    const { proveedor_id, usuario_id, detalles = [] } = req.body;

    console.log("Datos recibidos para crear compra:", req.body);

    if (!proveedor_id || !usuario_id || detalles.length === 0) {
      return res.status(400).json({ message: "Faltan datos requeridos o detalles vacíos." });
    }

    await client.query("BEGIN");

    // ============================================================
    // 1. Obtener correlativo compra
    // ============================================================
    const numeroResult = await client.query(
      `SELECT COALESCE(MAX(numero_documento::integer), 0) + 1 AS next_num FROM compra`
    );
    const numeroDoc = String(numeroResult.rows[0].next_num).padStart(6, "0");

    // ============================================================
    // 2. Total y saldo
    // ============================================================
    const total = detalles.reduce(
      (acc, item) => acc + Number(item.cantidad) * Number(item.costo_unitario),
      0
    );
    const saldo = total;

    // ============================================================
    // 3. Insertar compra
    // ============================================================
    const compraResult = await client.query(
      `INSERT INTO compra
       (numero_documento, proveedor_id, usuario_id, fecha, total, saldo, activo)
       VALUES ($1, $2, $3, NOW(), $4, $5, true)
       RETURNING id_compras`,
      [numeroDoc, proveedor_id, usuario_id, total, saldo]
    );
    const compra_id = compraResult.rows[0].id_compras;

    // ============================================================
    // 4. Crear encabezado movimiento inventario (ENTRADA)
    // ============================================================
    const movNumResult = await client.query(
      `SELECT COALESCE(MAX(id_movimientos_inventario), 0) + 1 AS next_num
       FROM movimiento_inventario`
    );

    const numeroMovimiento =
      "MOV-" + String(movNumResult.rows[0].next_num).padStart(6, "0");

    const movimientoResult = await client.query(
      `INSERT INTO movimiento_inventario 
      (numero_documento, tipo_movimiento_id, usuario_id, fecha, referencia, activo)
       VALUES ($1, 1, $2, NOW(), $3, true)
       RETURNING id_movimientos_inventario`,
      [
        numeroMovimiento,
        usuario_id,
        `COMPRA ${numeroDoc}`
      ]
    );

    const movimiento_id = movimientoResult.rows[0].id_movimientos_inventario;

    // ============================================================
    // 5. Insertar detalles + movimiento + actualizar inventario
    // ============================================================
    for (const item of detalles) {
      const producto_id = item.producto_id;
      const cantidad = Number(item.cantidad);
      const costo_unitario = Number(item.costo_unitario);

      if (!producto_id || cantidad <= 0) {
        throw new Error("Detalle inválido: producto_id y cantidad > 0 requeridos.");
      }

      // 5.1 Insertar detalle de compra
      await client.query(
        `INSERT INTO compra_detalle
         (compra_id, producto_id, cantidad, costo_unitario, activo)
         VALUES ($1, $2, $3, $4, true)`,
        [compra_id, producto_id, cantidad, costo_unitario]
      );

      // 5.2 Insertar detalle de movimiento inventario (ENTRADA)
      await client.query(
        `INSERT INTO movimiento_inventario_detalle
         (movimiento_inventario_id, producto_id, cantidad, costo_unitario, activo)
         VALUES ($1, $2, $3, $4, true)`,
        [
          movimiento_id,
          producto_id,
          cantidad, // entrada
          costo_unitario
        ]
      );

      // ============================================================
      // 5.3 Actualizar stock + costo PROMEDIO
      // ============================================================

      // Traer stock y costo actual antes de actualizar
      const prodResult = await client.query(
        `SELECT stock, costo FROM producto WHERE id_productos = $1`,
        [producto_id]
      );

      const stockActual = Number(prodResult.rows[0]?.stock ?? 0);
      const costoActual = Number(prodResult.rows[0]?.costo ?? 0);

      const nuevoStock = stockActual + cantidad;

      const nuevoCosto =
        stockActual === 0
          ? costo_unitario
          : ((stockActual * costoActual) + (cantidad * costo_unitario)) /
          (stockActual + cantidad);

      // Actualizar producto
      await client.query(
        `UPDATE producto
         SET stock = $1,
             costo = $2
         WHERE id_productos = $3`,
        [nuevoStock, nuevoCosto, producto_id]
      );
    }

    // ============================================================
    // 6. Commit
    // ============================================================
    await client.query("COMMIT");

    return res.status(201).json({
      message: "Compra registrada exitosamente.",
      compra_id,
      numero_documento: numeroDoc,
      total,
      saldo
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};



export const getCompras = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const text = `
      SELECT c.*,
             p.nombre AS proveedor_nombre,
             u.nombre AS usuario_nombre
      FROM compra c
      LEFT JOIN proveedor p ON p.id_proveedores = c.proveedor_id
      LEFT JOIN usuario u ON u.id_usuarios = c.usuario_id
      ORDER BY c.fecha DESC, c.id_compras DESC
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await pool.query(text, [limit, offset]);
    return res.json(rows);
  } catch (err) {
    console.error('getCompras error:', err);
    return res.status(500).json({ message: 'Error al obtener compras', error: err.message });
  }
};


export const getCompraById = async (req, res) => {
  const { id } = req.params;
  try {
    const compraQ = `
      SELECT c.*, p.nombre AS proveedor_nombre, u.nombre AS usuario_nombre
      FROM compra c
      LEFT JOIN proveedor p ON p.id_proveedores = c.proveedor_id
      LEFT JOIN usuario u ON u.id_usuarios = c.usuario_id
      WHERE c.id_compras = $1;
    `;
    const { rows: compraRows } = await pool.query(compraQ, [id]);
    if (compraRows.length === 0) {
      return res.status(404).json({ message: 'Compra no encontrada' });
    }
    const compra = compraRows[0];

    const detallesQ = `
      SELECT d.*, prod.nombre AS producto_nombre
      FROM compra_detalle d
      LEFT JOIN producto prod ON prod.id_productos = d.producto_id
      WHERE d.compra_id = $1 AND d.activo = TRUE;
    `;
    const { rows: detalles } = await pool.query(detallesQ, [id]);

    return res.json({ compra, detalles });
  } catch (err) {
    console.error('getCompraById error:', err);
    return res.status(500).json({ message: 'Error al obtener compra', error: err.message });
  }
};


export const anularCompra = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM compra WHERE id_compras = $1 FOR UPDATE', [id]);
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Compra no encontrada' });
    }
    const compra = rows[0];
    if (!compra.activo) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'La compra ya está anulada' });
    }

    const { rows: detalles } = await client.query(
      'SELECT * FROM compra_detalle WHERE compra_id = $1 AND activo = TRUE',
      [id]
    );

    for (const d of detalles) {
      const cantidad = Number(d.cantidad || 0);
      if (cantidad <= 0) continue;

      await client.query(
        `UPDATE producto
         SET stock = GREATEST(COALESCE(stock,0) - $1, 0)
         WHERE id_productos = $2`,
        [cantidad, d.producto_id]
      );

      await client.query('UPDATE compra_detalle SET activo = FALSE WHERE id_compra_detalle = $1', [d.id_compra_detalle]);
    }

    await client.query('UPDATE compra SET activo = FALSE, saldo = 0 WHERE id_compras = $1', [id]);

    await client.query('COMMIT');
    return res.json({ message: 'Compra anulada y inventario revertido', compra_id: id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('anularCompra error:', err);
    return res.status(500).json({ message: 'Error al anular compra', error: err.message });
  } finally {
    client.release();
  }
};

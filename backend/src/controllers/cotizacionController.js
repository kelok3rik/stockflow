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
    const values = detalles.map(d => [cotizacionId, d.producto_id, d.cantidad, d.precio_unitario || d.precio]);
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

    const totalFinal = totalResult.rows[0].total || 0;

    await client.query(
      `UPDATE cotizacion SET total = $1 WHERE id_cotizaciones = $2`,
      [totalFinal, cotizacionId]
    );

    await client.query("COMMIT");

    // 4. Generar numero_documento tipo COT-0001
    const numero_documento = `COT-${cotizacionId.toString().padStart(4, '0')}`;

    res.json({
      message: "Cotización creada correctamente",
      cotizacionId,
      numero_documento
    });
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

export const convertirCotizacionAFactura = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { condicion_id, monto_recibido = 0 } = req.body;

    if (!condicion_id) {
      return res.status(400).json({ message: "Condición de pago requerida" });
    }

    await client.query("BEGIN");

    const cotizacionRes = await client.query(
      `SELECT * FROM cotizacion 
       WHERE id_cotizaciones = $1 AND activo = true`,
      [id]
    );

    if (cotizacionRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    const cotizacion = cotizacionRes.rows[0];

    const detallesRes = await client.query(
      `SELECT * FROM cotizacion_detalle WHERE cotizacion_id = $1`,
      [id]
    );

    if (detallesRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Cotización sin detalles" });
    }

    const condicionRes = await client.query(
      `SELECT dias_plazo 
       FROM condicion_pago 
       WHERE id_condiciones_pago = $1 AND activo = true`,
      [condicion_id]
    );

    if (condicionRes.rows.length === 0) {
      throw new Error("Condición de pago inválida");
    }

    const diasPlazo = Number(condicionRes.rows[0].dias_plazo);
    const esContado = diasPlazo === 0;

    const total = Number(cotizacion.total);
    const recibido = Number(monto_recibido);

    if (esContado && recibido < total) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Monto recibido insuficiente" });
    }

    const saldo = esContado ? 0 : total;
    const estadoFactura = esContado ? "PAGADA" : "PENDIENTE";

    const numeroRes = await client.query(
      `SELECT COALESCE(MAX(numero_documento::integer),0) + 1 AS next_num 
       FROM factura`
    );

    const numeroDocumento = String(numeroRes.rows[0].next_num).padStart(6, "0");

    const facturaRes = await client.query(
      `INSERT INTO factura
       (numero_documento, cliente_id, usuario_id, condicion_id, total, saldo, estado, fecha, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),true)
       RETURNING id_facturas`,
      [
        numeroDocumento,
        cotizacion.cliente_id,
        cotizacion.usuario_id,
        condicion_id,
        total,
        saldo,
        estadoFactura
      ]
    );

    const facturaId = facturaRes.rows[0].id_facturas;

    const movRes = await client.query(
      `SELECT COALESCE(MAX(id_movimientos_inventario),0) + 1 AS next_num
       FROM movimiento_inventario`
    );

    const numeroMovimiento =
      "MOV-" + String(movRes.rows[0].next_num).padStart(6, "0");

    const movimientoRes = await client.query(
      `INSERT INTO movimiento_inventario
       (numero_documento, tipo_movimiento_id, usuario_id, fecha, referencia, activo)
       VALUES ($1,2,$2,NOW(),$3,true)
       RETURNING id_movimientos_inventario`,
      [
        numeroMovimiento,
        cotizacion.usuario_id,
        `FACTURA ${numeroDocumento}`
      ]
    );

    const movimientoId = movimientoRes.rows[0].id_movimientos_inventario;

    for (const d of detallesRes.rows) {
      await client.query(
        `INSERT INTO factura_detalle
         (factura_id, producto_id, cantidad, precio_unitario, activo)
         VALUES ($1,$2,$3,$4,true)`,
        [
          facturaId,
          d.producto_id,
          d.cantidad,
          d.precio_unitario
        ]
      );

      const costoRes = await client.query(
        `SELECT costo FROM producto WHERE id_productos = $1`,
        [d.producto_id]
      );

      await client.query(
        `INSERT INTO movimiento_inventario_detalle
         (movimiento_inventario_id, producto_id, cantidad, costo_unitario, activo)
         VALUES ($1,$2,$3,$4,true)`,
        [
          movimientoId,
          d.producto_id,
          d.cantidad * -1,
          costoRes.rows[0].costo
        ]
      );

      await client.query(
        `UPDATE producto 
         SET stock = stock - $1 
         WHERE id_productos = $2`,
        [d.cantidad, d.producto_id]
      );
    }

    // ✅ CORRECTO: desactivar cotización
    await client.query(
      `UPDATE cotizacion SET activo = false WHERE id_cotizaciones = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Cotización convertida en factura",
      factura_id: facturaId,
      numero_documento: numeroDocumento
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR CONVERTIR COTIZACION:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};






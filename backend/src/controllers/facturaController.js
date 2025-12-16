import pool from '../database/db.js';

// Obtener todas las facturas
export const getFacturas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.id_facturas,
        f.fecha,
        f.numero_documento,
        f.total,
        f.saldo,
        f.estado,
        c.nombre AS cliente,
        COALESCE(
          json_agg(
            json_build_object(
              'id_factura_detalle', fd.id_factura_detalle,
              'id_productos', fd.producto_id,
              'producto', p.nombre,
              'cantidad', fd.cantidad,
              'precio_unitario', fd.precio_unitario,
              'subtotal', (fd.cantidad * fd.precio_unitario)
            )
          ) FILTER (WHERE fd.id_factura_detalle IS NOT NULL),
          '[]'
        ) AS detalles
      FROM factura f
      LEFT JOIN cliente c ON f.cliente_id = c.id_clientes
      LEFT JOIN factura_detalle fd ON f.id_facturas = fd.factura_id
      LEFT JOIN producto p ON fd.producto_id = p.id_productos
      GROUP BY f.id_facturas, c.nombre
      ORDER BY f.id_facturas DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener facturas pendientes de un cliente
export const getFacturasPendientes = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const result = await pool.query(
      `SELECT 
        id_facturas,
        numero_documento,
        fecha,
        total,
        saldo,
        estado
       FROM factura
       WHERE cliente_id = $1
         AND saldo > 0
       ORDER BY fecha ASC`,
      [cliente_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const abonarFactura = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_factura, abono, usuario_id, metodo_pago = "EFECTIVO" } = req.body;

    await client.query('BEGIN');

    // 1️⃣ Obtener saldo actual de la factura y el cliente
    const { rows } = await client.query(
      'SELECT saldo, cliente_id FROM factura WHERE id_facturas = $1 FOR UPDATE',
      [id_factura]
    );

    if (!rows.length) throw new Error('Factura no encontrada');

    const saldoActual = parseFloat(rows[0].saldo);
    const cliente_id = rows[0].cliente_id;

    if (abono > saldoActual) throw new Error('El abono excede el saldo pendiente');

    // 2️⃣ Actualizar saldo y estado de la factura
    const nuevoSaldo = saldoActual - abono;
    const nuevoEstado = nuevoSaldo === 0 ? 'PAGADA' : 'PENDIENTE';

    await client.query(
      'UPDATE factura SET saldo = $1, estado = $2 WHERE id_facturas = $3',
      [nuevoSaldo, nuevoEstado, id_factura]
    );

    // 3️⃣ Generar número de documento seguro para cobro
    const numeroResult = await client.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(numero_documento FROM 5) AS INTEGER)), 0) + 1 AS next_num
       FROM cobro`
    );
    const numeroDocumento = "PAG-" + String(numeroResult.rows[0].next_num).padStart(6, '0');

    // 4️⃣ Insertar abono en tabla cobro vinculando factura y cliente
    await client.query(
      `INSERT INTO cobro (numero_documento, factura_id, cliente_id, usuario_id, fecha, monto, metodo_pago, activo)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, true)`,
      [numeroDocumento, id_factura, cliente_id, usuario_id, abono, metodo_pago]
    );

    await client.query('COMMIT');

    // 5️⃣ Respuesta exitosa
    res.json({
      success: true,
      nuevoSaldo,
      nuevoEstado,
      numeroDocumento
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};





const generarNumeroDocumento = async () => {
  const result = await pool.query(`
    SELECT COALESCE(MAX(CAST(numero_documento AS INTEGER)), 0) + 1 AS nuevo_numero
    FROM factura
  `);
  // Formatear con ceros a la izquierda (ej: "000001")
  return result.rows[0].nuevo_numero.toString().padStart(6, '0');
};

export const createFactura = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      cliente_id,
      usuario_id,
      condicion_id,
      total,
      monto_recibido,
      cambio,
      detalles
    } = req.body;

    console.log("Datos recibidos para crear factura:", req.body);

    await client.query("BEGIN");

    // ============================================================
    // 1. Obtener condición de pago
    // ============================================================
    const condResult = await client.query(
      `SELECT dias_plazo 
       FROM condicion_pago 
       WHERE id_condiciones_pago = $1`,
      [condicion_id]
    );

    if (condResult.rows.length === 0) {
      throw new Error("La condición de pago no existe.");
    }

    const dias_plazo = Number(condResult.rows[0].dias_plazo);
    const esContado = dias_plazo === 0;

    const totalNum = Number(total);
    const recibido = Number(monto_recibido);

    if (esContado && (isNaN(recibido) || recibido < totalNum)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "El monto recibido es menor que el total."
      });
    }

    const saldo = esContado ? 0 : totalNum;
    const estado = esContado ? "PAGADA" : "PENDIENTE";

    // ============================================================
    // 2. Obtener correlativo factura
    // ============================================================
    const numeroResult = await client.query(
      `SELECT COALESCE(MAX(numero_documento::integer), 0) + 1 AS next_num
       FROM factura`
    );

    const numeroDoc = String(numeroResult.rows[0].next_num).padStart(6, "0");

    // ============================================================
    // 3. Insertar factura
    // ============================================================
    const facturaResult = await client.query(
      `INSERT INTO factura 
      (numero_documento, cliente_id, usuario_id, fecha, condicion_id, total, saldo, estado, activo)
      VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, true)
      RETURNING id_facturas`,
      [
        numeroDoc,
        cliente_id,
        usuario_id,
        condicion_id,
        totalNum,
        saldo,
        estado
      ]
    );

    const factura_id = facturaResult.rows[0].id_facturas;

    // ============================================================
    // 4. Insertar encabezado movimiento inventario (Opción B)
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
       VALUES ($1, 2, $2, NOW(), $3, true)
       RETURNING id_movimientos_inventario`,
      [
        numeroMovimiento,
        usuario_id,
        `FACTURA ${numeroDoc}`
      ]
    );

    const movimiento_id = movimientoResult.rows[0].id_movimientos_inventario;

    // ============================================================
    // 5. Insertar detalles: factura + movimiento + stock
    // ============================================================
    for (const item of detalles) {
      const { producto_id, cantidad, precio_unitario } = item;

      // 5.1 Insertar detalle factura
      await client.query(
        `INSERT INTO factura_detalle 
        (factura_id, producto_id, cantidad, precio_unitario, activo)
        VALUES ($1, $2, $3, $4, true)`,
        [
          factura_id,
          producto_id,
          cantidad,
          precio_unitario
        ]
      );

      // ============================================
      // 5.2 Obtener costo real del producto
      // ============================================
      const costoQuery = await client.query(
        `SELECT costo FROM producto WHERE id_productos = $1`,
        [producto_id]
      );

      if (costoQuery.rows.length === 0) {
        throw new Error(`El producto ${producto_id} no existe`);
      }

      const costoUnitario = Number(costoQuery.rows[0].costo);

      // ============================================
      // 5.3 Insertar detalle del movimiento con costo real
      // ============================================
      await client.query(
        `INSERT INTO movimiento_inventario_detalle
        (movimiento_inventario_id, producto_id, cantidad, costo_unitario, activo)
        VALUES ($1, $2, $3, $4, true)`,
        [
          movimiento_id,
          producto_id,
          cantidad * -1, // salida
          costoUnitario
        ]
      );

      // ============================================
      // 5.4 Actualizar stock
      // ============================================
      await client.query(
        `UPDATE producto 
         SET stock = stock - $1 
         WHERE id_productos = $2`,
        [cantidad, producto_id]
      );
    }

    // ============================================================
    // COMMIT FINAL
    // ============================================================
    await client.query("COMMIT");

    return res.status(201).json({
      message: "Factura creada exitosamente.",
      factura_id,
      numero_documento: numeroDoc,
      estado,
      saldo,
      cambio: esContado ? Number(cambio) : 0
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};





import pool from '../database/db.js';

// Obtener todas las facturas
export const getFacturas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.id_facturas,
        f.fecha,
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

// Función para generar número de documento secuencial
const generarNumeroDocumento = async () => {
  const result = await pool.query(`
    SELECT COALESCE(MAX(CAST(numero_documento AS INTEGER)), 0) + 1 AS nuevo_numero
    FROM factura
  `);
  // Formatear con ceros a la izquierda (ej: "000001")
  return result.rows[0].nuevo_numero.toString().padStart(6, '0');
};

// Crear factura con detalles
export const createFactura = async (req, res) => {
  const {
    cliente_id,
    usuario_id,
    condicion_id,    // 1 = contado
    monto_recibido,  // solo si contado
    detalles
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Generar número secuencial
    const numero_documento = await generarNumeroDocumento();

    // Insertar cabecera temporal (total 0)
    const facturaResult = await client.query(
      `INSERT INTO factura (numero_documento, cliente_id, usuario_id, condicion_id, total, saldo, estado)
       VALUES ($1, $2, $3, $4, 0, 0, 'PENDIENTE')
       RETURNING id_facturas`,
      [numero_documento, cliente_id, usuario_id, condicion_id]
    );

    const facturaId = facturaResult.rows[0].id_facturas;

    let totalFactura = 0;

    // Insertar detalles y actualizar stock
    for (const item of detalles) {
      const { producto_id, cantidad, precio_unitario } = item;
      const subtotal = cantidad * precio_unitario;
      totalFactura += subtotal;

      await client.query(
        `INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [facturaId, producto_id, cantidad, precio_unitario]
      );

      // Actualizar stock
      await client.query(
        `UPDATE producto SET stock = stock - $1 WHERE id_productos = $2`,
        [cantidad, producto_id]
      );
    }

    // ==========================
    //  CONTADO
    // ==========================
    if (condicion_id === 1) {

      // Validar monto recibido
      if (!monto_recibido || monto_recibido < totalFactura) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: "El monto recibido es menor que el total."
        });
      }

      const cambio = monto_recibido - totalFactura;

      // Actualizar factura como pagada
      await client.query(
        `UPDATE factura
         SET total = $1, saldo = 0, estado = 'PAGADA', monto_recibido = $2, cambio = $3
         WHERE id_facturas = $4`,
        [totalFactura, monto_recibido, cambio, facturaId]
      );

      // Registrar pago
      await client.query(
        `INSERT INTO pagos_factura (factura_id, monto_pagado, usuario_id)
         VALUES ($1, $2, $3)`,
        [facturaId, totalFactura, usuario_id]
      );
    }

    // ==========================
    //  CRÉDITO
    // ==========================
    else {
      // Actualizar factura como pendiente
      await client.query(
        `UPDATE factura
         SET total = $1, saldo = $1, estado = 'PENDIENTE'
         WHERE id_facturas = $2`,
        [totalFactura, facturaId]
      );

      // Crear cuenta por cobrar
      const cxcResult = await client.query(
        `INSERT INTO cuenta_por_cobrar (cliente_id, factura_id, total, balance)
         VALUES ($1, $2, $3, $4)
         RETURNING id_cxc`,
        [cliente_id, facturaId, totalFactura, totalFactura]
      );

      const id_cxc = cxcResult.rows[0].id_cxc;

      // Insertar movimiento inicial
      await client.query(
        `INSERT INTO detalle_de_cxc (cxc_id, factura_id, descripcion, debito, credito, balance)
         VALUES ($1, $2, 'Factura a crédito', $3, 0, $3)`,
        [id_cxc, facturaId, totalFactura]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      facturaId,
      numero_documento,
      total: totalFactura
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

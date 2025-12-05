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
  const { cliente_id, usuario_id, condicion_id, detalles } = req.body;

  try {
    await pool.query('BEGIN');

    // Generar número de documento
    const numero_documento = await generarNumeroDocumento();

    // Insertar cabecera de factura
    const result = await pool.query(
      `INSERT INTO factura (numero_documento, cliente_id, usuario_id, condicion_id, total, saldo, estado)
       VALUES ($1, $2, $3, $4, 0, 0, 'PENDIENTE') RETURNING id_facturas`,
      [numero_documento, cliente_id, usuario_id, condicion_id]
    );

    const facturaId = result.rows[0].id_facturas;
    let totalFactura = 0;

    // Insertar detalles y actualizar stock
    for (const item of detalles) {
      const { producto_id, cantidad, precio_unitario } = item;
      const subtotal = cantidad * precio_unitario;
      totalFactura += subtotal;

      await pool.query(
        `INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [facturaId, producto_id, cantidad, precio_unitario]
      );

      // Actualizar stock
      await pool.query(
        `UPDATE producto SET stock = stock - $1 WHERE id_productos = $2`,
        [cantidad, producto_id]
      );
    }

    // Actualizar total y saldo en la factura
    await pool.query(
      `UPDATE factura SET total = $1, saldo = $1 WHERE id_facturas = $2`,
      [totalFactura, facturaId]
    );

    await pool.query('COMMIT');

    res.status(201).json({ facturaId, numero_documento });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

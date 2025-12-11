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

    // 1. Obtener condición de pago
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

    // 2. Validar monto recibido SOLO si es contado
    const totalNum = Number(total);
    const recibido = Number(monto_recibido);

    if (esContado && (isNaN(recibido) || recibido < totalNum)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "El monto recibido es menor que el total."
      });
    }

    // 3. Calcular saldo y estado
    const saldo = esContado ? 0 : totalNum;
    const estado = esContado ? "PAGADA" : "PENDIENTE";

    // 4. Obtener número correlativo
    const numeroResult = await client.query(
      `SELECT COALESCE(MAX(numero_documento::integer), 0) + 1 AS next_num
       FROM factura`
    );

    const numeroDoc = String(numeroResult.rows[0].next_num).padStart(6, "0");

    // 5. Insertar factura
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

    // <--- ESTE ES EL ID REAL
    const factura_id = facturaResult.rows[0].id_facturas;

    // 6. Insertar detalle (FACTURA_DETALLE corrección completa)
    for (const item of detalles) {
      await client.query(
        `INSERT INTO factura_detalle 
        (factura_id, producto_id, cantidad, precio_unitario, activo)
        VALUES ($1, $2, $3, $4, true)`,
        [
          factura_id,
          item.producto_id,
          item.cantidad,
          item.precio_unitario
        ]
      );

      // Descontar inventario
      await client.query(
        `UPDATE producto 
         SET stock = stock - $1 
         WHERE id_productos = $2`,
        [item.cantidad, item.producto_id]
      );
    }

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



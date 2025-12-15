// backend/src/controllers/cobroController.js
import pool from '../database/db.js';


export const listarCobros = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT co.*,
             f.id_facturas AS factura_id,
             f.numero_documento AS numero_factura,
             cl.nombre AS cliente_nombre
      FROM cobro co
      LEFT JOIN factura f ON f.id_facturas = co.factura_id
      LEFT JOIN cliente cl ON cl.id_clientes = f.cliente_id
      ORDER BY co.fecha DESC
    `);

    return res.json(rows);
  } catch (err) {
    console.error('listarCobros error:', err);
    return res.status(500).json({ message: 'Error al obtener los cobros', error: err.message });
  }
};

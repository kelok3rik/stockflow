// controllers/pagoController.js
import pool from '../database/db.js';


export const listarPagos = async (req, res) => {
    try {
        const query = `
      SELECT pa.*,
             c.id_compras AS compra_id,
             c.numero_documento AS numero_compra,
             p.nombre AS proveedor_nombre
      FROM pago pa
      LEFT JOIN compra c ON c.id_compras = pa.compra_id
      LEFT JOIN proveedor p ON p.id_proveedores = pa.proveedor_id
      ORDER BY pa.fecha DESC
    `;

        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error("listarPagos error:", err);
        res.status(500).json({ error: err.message });
    }
};
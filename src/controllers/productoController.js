// src/controllers/productoController.js
import pool from "../database/conexion.js";

// Obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, 
                d.nombre AS departamento,
                g.nombre AS grupo,
                u.nombre AS ubicacion
             FROM producto p
             LEFT JOIN departamento d ON p.departamento_id = d.id_departamentos
             LEFT JOIN grupo g ON p.grupo_id = g.id_grupos
             LEFT JOIN ubicacion u ON p.ubicacion_id = u.id_ubicaciones
             ORDER BY p.id_productos DESC`
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener producto por ID
export const getProductoById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM producto WHERE id_productos = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear producto
export const createProducto = async (req, res) => {
    try {
        const {
            sku,
            nombre,
            departamento_id,
            grupo_id,
            unidad,
            precio_venta,
            costo,
            stock,
            stock_min,
            ubicacion_id,
            activo
        } = req.body;

        const result = await pool.query(
            `INSERT INTO producto (
                sku, nombre, departamento_id, grupo_id, unidad,
                precio_venta, costo, stock, stock_min, ubicacion_id, activo
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [
                sku,
                nombre,
                departamento_id,
                grupo_id,
                unidad,
                precio_venta,
                costo,
                stock,
                stock_min,
                ubicacion_id,
                activo ?? true
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar producto
export const updateProducto = async (req, res) => {
    try {
        const {
            sku,
            nombre,
            departamento_id,
            grupo_id,
            unidad,
            precio_venta,
            costo,
            stock,
            stock_min,
            ubicacion_id,
            activo
        } = req.body;

        const result = await pool.query(
            `UPDATE producto SET
                sku = $1,
                nombre = $2,
                departamento_id = $3,
                grupo_id = $4,
                unidad = $5,
                precio_venta = $6,
                costo = $7,
                stock = $8,
                stock_min = $9,
                ubicacion_id = $10,
                activo = $11
            WHERE id_productos = $12
            RETURNING *`,
            [
                sku,
                nombre,
                departamento_id,
                grupo_id,
                unidad,
                precio_venta,
                costo,
                stock,
                stock_min,
                ubicacion_id,
                activo,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar producto
export const deleteProducto = async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM producto WHERE id_productos = $1 RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

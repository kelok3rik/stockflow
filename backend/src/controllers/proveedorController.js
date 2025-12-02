// src/controllers/proveedorController.js
import pool from '../database/db.js';

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM proveedor ORDER BY id_proveedores DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener proveedor por ID
export const getProveedorById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM proveedor WHERE id_proveedores = $1",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Proveedor no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo proveedor:', error);
    res.status(500).json({ message: error.message });
  }
};

// Crear proveedor
export const createProveedor = async (req, res) => {
  try {
    const { nombre, telefono, direccion, rnc, email, activo } = req.body;

    const result = await pool.query(
      `INSERT INTO proveedor (nombre, telefono, direccion, rnc, email, activo)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [nombre, telefono, direccion, rnc, email, activo ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando proveedor:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar proveedor
export const updateProveedor = async (req, res) => {
  try {
    const { nombre, telefono, direccion, rnc, email, activo } = req.body;

    const result = await pool.query(
      `UPDATE proveedor SET
         nombre = $1,
         telefono = $2,
         direccion = $3,
         rnc = $4,
         email = $5,
         activo = $6
       WHERE id_proveedores = $7
       RETURNING *`,
      [nombre, telefono, direccion, rnc, email, activo, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Proveedor no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar proveedor
export const deleteProveedor = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM proveedor WHERE id_proveedores = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Proveedor no encontrado" });

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    res.status(500).json({ message: error.message });
  }
};

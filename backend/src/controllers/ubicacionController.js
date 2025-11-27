import pool from '../database/db.js';

// Obtener todas las ubicaciones
export const getUbicaciones = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ubicacion');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
};

// Obtener una ubicación por ID
export const getUbicacionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM ubicacion WHERE id_ubicaciones = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ubicación no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la ubicación' });
  }
};

// Crear una nueva ubicación
export const createUbicacion = async (req, res) => {
  const { codigo, nombre, id_almacen, activo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ubicacion (codigo, nombre, id_almacen, activo) VALUES ($1, $2, $3, $4) RETURNING *',
      [codigo, nombre, id_almacen, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la ubicación' });
  }
};

// Actualizar una ubicación
export const updateUbicacion = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, id_almacen, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE ubicacion SET codigo=$1, nombre=$2, id_almacen=$3, activo=$4 WHERE id_ubicaciones=$5 RETURNING *',
      [codigo, nombre, id_almacen, activo ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ubicación no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la ubicación' });
  }
};

// Eliminar una ubicación
export const deleteUbicacion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM ubicacion WHERE id_ubicaciones=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ubicación no encontrada' });
    res.json({ message: 'Ubicación eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la ubicación' });
  }
};

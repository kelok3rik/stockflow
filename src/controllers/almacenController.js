import pool from '../database/db.js';

// Obtener todos los almacenes
export const getAlmacenes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM almacen');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los almacenes' });
  }
};

// Obtener un almacén por ID
export const getAlmacenById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM almacen WHERE id_almacen = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el almacén' });
  }
};

// Crear un nuevo almacén
export const createAlmacen = async (req, res) => {
  const { codigo, nombre, activo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO almacen (codigo, nombre, activo) VALUES ($1, $2, $3) RETURNING *',
      [codigo, nombre, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el almacén' });
  }
};

// Actualizar un almacén
export const updateAlmacen = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE almacen SET codigo=$1, nombre=$2, activo=$3 WHERE id_almacen=$4 RETURNING *',
      [codigo, nombre, activo ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el almacén' });
  }
};

// Eliminar un almacén
export const deleteAlmacen = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM almacen WHERE id_almacen=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
    res.json({ message: 'Almacén eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el almacén' });
  }
};

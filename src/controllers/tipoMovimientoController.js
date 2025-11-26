import pool from '../database/db.js';

// Obtener todos los tipos de movimiento
export const getTiposMovimiento = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipo_movimiento');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tipos de movimiento' });
  }
};

// Obtener un tipo de movimiento por ID
export const getTipoMovimientoById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM tipo_movimiento WHERE id_tipos_movimiento = $1',
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Tipo de movimiento no encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el tipo de movimiento' });
  }
};

// Crear un nuevo tipo de movimiento
export const createTipoMovimiento = async (req, res) => {
  const { nombre, clase, descripcion, activo } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tipo_movimiento (nombre, clase, descripcion, activo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, clase, descripcion, activo ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23514') {
      return res.status(400).json({
        error: "La clase debe ser 'ENTRADA' o 'SALIDA'"
      });
    }

    res.status(500).json({ error: 'Error al crear el tipo de movimiento' });
  }
};

// Actualizar un tipo de movimiento
export const updateTipoMovimiento = async (req, res) => {
  const { id } = req.params;
  const { nombre, clase, descripcion, activo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tipo_movimiento
       SET nombre=$1, clase=$2, descripcion=$3, activo=$4
       WHERE id_tipos_movimiento=$5 RETURNING *`,
      [nombre, clase, descripcion, activo ?? true, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Tipo de movimiento no encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23514') {
      return res.status(400).json({
        error: "La clase debe ser 'ENTRADA' o 'SALIDA'"
      });
    }

    res.status(500).json({ error: 'Error al actualizar el tipo de movimiento' });
  }
};

// Eliminar un tipo de movimiento
export const deleteTipoMovimiento = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tipo_movimiento WHERE id_tipos_movimiento=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Tipo de movimiento no encontrado' });

    res.json({ message: 'Tipo de movimiento eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el tipo de movimiento' });
  }
};

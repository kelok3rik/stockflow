import pool from '../database/db.js';

// Obtener todas las condiciones de pago
export const getCondicionesPago = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM condicion_pago ORDER BY id_condiciones_pago');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener condiciones de pago' });
  }
};

// Obtener una condición de pago por ID
export const getCondicionPagoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM condicion_pago WHERE id_condiciones_pago=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Condición de pago no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la condición de pago' });
  }
};

// Crear una nueva condición de pago
export const createCondicionPago = async (req, res) => {
  const { nombre, dias_plazo, activo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO condicion_pago (nombre, dias_plazo, activo)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, dias_plazo ?? 0, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la condición de pago' });
  }
};

// Actualizar una condición de pago
export const updateCondicionPago = async (req, res) => {
  const { id } = req.params;
  const { nombre, dias_plazo, activo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE condicion_pago
       SET nombre=$1, dias_plazo=$2, activo=$3
       WHERE id_condiciones_pago=$4 RETURNING *`,
      [nombre, dias_plazo, activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Condición de pago no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la condición de pago' });
  }
};

// Eliminar una condición de pago
export const deleteCondicionPago = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM condicion_pago WHERE id_condiciones_pago=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Condición de pago no encontrada' });
    res.json({ message: 'Condición de pago eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la condición de pago' });
  }
};

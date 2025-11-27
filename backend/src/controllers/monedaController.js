import pool from '../database/db.js';

// Obtener todas las monedas
export const getMonedas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM moneda ORDER BY id_monedas');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener monedas' });
  }
};

// Obtener una moneda por ID
export const getMonedaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM moneda WHERE id_monedas=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Moneda no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la moneda' });
  }
};

// Crear una nueva moneda
export const createMoneda = async (req, res) => {
  const { codigo, nombre, simbolo, tasa_cambio, es_base, activo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO moneda (codigo, nombre, simbolo, tasa_cambio, es_base, activo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [codigo, nombre, simbolo, tasa_cambio ?? 1, es_base ?? false, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la moneda' });
  }
};

// Actualizar una moneda
export const updateMoneda = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, simbolo, tasa_cambio, es_base, activo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE moneda
       SET codigo=$1, nombre=$2, simbolo=$3, tasa_cambio=$4, es_base=$5, activo=$6
       WHERE id_monedas=$7 RETURNING *`,
      [codigo, nombre, simbolo, tasa_cambio, es_base, activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Moneda no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la moneda' });
  }
};

// Eliminar una moneda
export const deleteMoneda = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM moneda WHERE id_monedas=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Moneda no encontrada' });
    res.json({ message: 'Moneda eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la moneda' });
  }
};

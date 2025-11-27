import pool from '../database/db.js';

// Obtener todas las empresas
export const getEmpresas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empresa ORDER BY id_empresa');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

// Obtener una empresa por ID
export const getEmpresaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM empresa WHERE id_empresa=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la empresa' });
  }
};

// Crear una nueva empresa
export const createEmpresa = async (req, res) => {
  const { nombre, rnc, direccion, telefono, email, logo_url, moneda_base_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO empresa (nombre, rnc, direccion, telefono, email, logo_url, moneda_base_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, rnc, direccion, telefono, email, logo_url, moneda_base_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la empresa' });
  }
};

// Actualizar una empresa
export const updateEmpresa = async (req, res) => {
  const { id } = req.params;
  const { nombre, rnc, direccion, telefono, email, logo_url, moneda_base_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE empresa
       SET nombre=$1, rnc=$2, direccion=$3, telefono=$4, email=$5, logo_url=$6, moneda_base_id=$7
       WHERE id_empresa=$8 RETURNING *`,
      [nombre, rnc, direccion, telefono, email, logo_url, moneda_base_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la empresa' });
  }
};

// Eliminar una empresa
export const deleteEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM empresa WHERE id_empresa=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la empresa' });
  }
};

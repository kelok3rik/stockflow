import pool from '../database/db.js';

// Obtener todos los departamentos
export const getDepartamentos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departamento');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
};

// Obtener un departamento por ID
export const getDepartamentoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM departamento WHERE id_departamentos = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Departamento no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el departamento' });
  }
};

// Crear un nuevo departamento
export const createDepartamento = async (req, res) => {
  const { nombre, activo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO departamento (nombre, activo) VALUES ($1, $2) RETURNING *`,
      [nombre, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el departamento' });
  }
};

// Actualizar un departamento
export const updateDepartamento = async (req, res) => {
  const { id } = req.params;
  const { nombre, activo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE departamento SET nombre=$1, activo=$2 WHERE id_departamentos=$3 RETURNING *`,
      [nombre, activo ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Departamento no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el departamento' });
  }
};

// Eliminar un departamento
export const deleteDepartamento = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM departamento WHERE id_departamentos=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Departamento no encontrado' });
    res.json({ message: 'Departamento eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el departamento' });
  }
};

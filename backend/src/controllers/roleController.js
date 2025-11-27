import pool from '../database/db.js';

// Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM role ORDER BY id_roles');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM role WHERE id_roles=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el rol' });
  }
};

// Crear un nuevo rol
export const createRole = async (req, res) => {
  const { nombre, descripcion, activo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO role (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, descripcion, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el rol' });
  }
};

// Actualizar un rol
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE role SET nombre=$1, descripcion=$2, activo=$3 WHERE id_roles=$4 RETURNING *`,
      [nombre, descripcion, activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
};

// Eliminar un rol
export const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM role WHERE id_roles=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el rol' });
  }
};

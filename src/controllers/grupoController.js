import pool from '../database/db.js';

// Obtener todos los grupos
export const getGrupos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grupo');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los grupos' });
  }
};

// Obtener un grupo por ID
export const getGrupoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM grupo WHERE id_grupos = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el grupo' });
  }
};

// Crear un nuevo grupo
export const createGrupo = async (req, res) => {
  const { nombre, departamento_id, activo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO grupo (nombre, departamento_id, activo) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, departamento_id, activo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
};

// Actualizar un grupo
export const updateGrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre, departamento_id, activo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE grupo SET nombre=$1, departamento_id=$2, activo=$3 WHERE id_grupos=$4 RETURNING *`,
      [nombre, departamento_id, activo ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el grupo' });
  }
};

// Eliminar un grupo
export const deleteGrupo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM grupo WHERE id_grupos=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ message: 'Grupo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el grupo' });
  }
};

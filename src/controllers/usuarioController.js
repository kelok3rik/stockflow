// src/controllers/usuarioController.js

import pool from '../database/db.js';

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuario');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE id_usuarios = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  const { nombre, usuario, clave, id_rol } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO usuario (nombre, usuario, clave, id_rol)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, usuario, clave, id_rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Actualizar un usuario
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, usuario, clave, id_rol } = req.body;
  try {
    const result = await pool.query(
      `UPDATE usuario
       SET nombre=$1, usuario=$2, clave=$3, id_rol=$4
       WHERE id_usuarios=$5 RETURNING *`,
      [nombre, usuario, clave, id_rol, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuario WHERE id_usuarios=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

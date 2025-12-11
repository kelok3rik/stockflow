// src/controllers/usuarioController.js

import pool from '../database/db.js';


export const getUsuariosConTodo = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          u.*,
          r.nombre AS rol
       FROM usuario u
       LEFT JOIN role r ON u.id_rol = r.id_roles
       ORDER BY u.id_usuarios`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en getUsuariosConTodo:", error);
    res.status(500).json({ error: 'Error al obtener usuarios completos' });
  }
};



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

// Crear usuario
export const createUsuario = async (req, res) => {
  const { nombre, usuario, clave, id_rol, activo } = req.body; // <- activo
  try {
    const result = await pool.query(
      `INSERT INTO usuario (nombre, usuario, clave, id_rol, activo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, usuario, clave, id_rol, activo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Actualizar usuario
// Actualizar un usuario con permisos completos
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const permisos = req.body; // <- ahora tomamos todo lo que venga

  if (!permisos || Object.keys(permisos).length === 0) {
    return res.status(400).json({ error: "No se enviaron datos para actualizar" });
  }

  try {
    // Construir dinámicamente la query
    const fields = Object.keys(permisos);
    const values = Object.values(permisos);

    const setQuery = fields.map((f, i) => `${f}=$${i + 1}`).join(", ");

    const query = `UPDATE usuario SET ${setQuery} WHERE id_usuarios=$${fields.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
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

export const loginUsuario = async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE usuario=$1 AND activo=true',
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
    }

    const user = result.rows[0];

    if (user.clave !== clave) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Devolver usuario y permisos
    res.json({
      id: user.id_usuarios,
      nombre: user.nombre,
      usuario: user.usuario,
      rol: user.id_rol,
      permisos: {
        inv_productos: user.inv_productos,
        inv_almacenes: user.inv_almacenes,
        inv_ubicaciones: user.inv_ubicaciones,
        inv_departamentos: user.inv_departamentos,
        inv_grupos: user.inv_grupos,
        inv_cotizaciones: user.inv_cotizaciones,
        inv_compras: user.inv_compras,
        inv_movimientos: user.inv_movimientos,
        inv_devoluciones: user.inv_devoluciones,
        inv_facturacion: user.inv_facturacion,
        inv_consultas: user.inv_consultas,
        inv_reportes: user.inv_reportes,
        cxc_clientes: user.cxc_clientes,
        cxc_cobros: user.cxc_cobros,
        cxp_proveedores: user.cxp_proveedores,
        cxp_pagos: user.cxp_pagos,
        conf_usuario: user.conf_usuario,
        conf_roles: user.conf_roles,
        conf_empresa: user.conf_empresa,
        conf_moneda: user.conf_moneda,
        conf_condicion: user.conf_condicion
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

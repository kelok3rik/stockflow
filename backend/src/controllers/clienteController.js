import pool from '../database/db.js';

// Obtener todos los clientes
export const getClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cliente ORDER BY id_clientes DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

// Obtener cliente por ID
export const getClienteById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM cliente WHERE id_clientes = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

// Crear cliente
export const createCliente = async (req, res) => {
  const {
    nombre,
    rnc,
    telefono,
    direccion,
    correo,
    limite_credito,
    activo
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cliente (
        nombre, rnc, telefono, direccion, correo, limite_credito, activo
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [nombre, rnc, telefono, direccion, correo, limite_credito, activo ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

// Actualizar cliente
export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    rnc,
    telefono,
    direccion,
    correo,
    limite_credito,
    activo
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cliente SET
        nombre = $1,
        rnc = $2,
        telefono = $3,
        direccion = $4,
        correo = $5,
        limite_credito = $6,
        activo = $7
      WHERE id_clientes = $8
      RETURNING *`,
      [nombre, rnc, telefono, direccion, correo, limite_credito, activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

// Eliminar cliente
export const deleteCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cliente WHERE id_clientes = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

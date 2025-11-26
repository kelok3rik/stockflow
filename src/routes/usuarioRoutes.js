// src/routes/usuarioRoutes.js
import { Router } from 'express';
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario } from '../controllers/usuarioController.js';

const router = Router();

// Rutas CRUD para usuarios
router.get('/', getUsuarios);               // Obtener todos los usuarios
router.get('/:id', getUsuarioById);         // Obtener un usuario por ID
router.post('/', createUsuario);            // Crear un nuevo usuario
router.put('/:id', updateUsuario);          // Actualizar un usuario por ID
router.delete('/:id', deleteUsuario);       // Eliminar un usuario por ID

export default router;

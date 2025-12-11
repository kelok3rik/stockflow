// src/routes/usuarioRoutes.js
import { Router } from 'express';
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, loginUsuario, getUsuariosConTodo } from '../controllers/usuarioController.js';

const router = Router();

// Rutas CRUD para usuarios
router.get('/', getUsuarios);               // Obtener todos los usuarios
router.get('/query', getUsuariosConTodo); // Obtener usuarios con filtros
router.get('/:id', getUsuarioById);         // Obtener un usuario por ID
router.post('/', createUsuario);            // Crear un nuevo usuario
router.put('/:id', updateUsuario);          // Actualizar un usuario por ID
router.delete('/:id', deleteUsuario);       // Eliminar un usuario por ID
router.post('/login', loginUsuario);         // Login de usuario

export default router;

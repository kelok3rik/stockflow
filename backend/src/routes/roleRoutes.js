import { Router } from 'express';
import { 
  getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} from '../controllers/roleController.js';

const router = Router();

// Rutas CRUD para roles
router.get('/', getRoles);              // Obtener todos los roles
router.get('/:id', getRoleById);       // Obtener rol por ID
router.post('/', createRole);          // Crear nuevo rol
router.put('/:id', updateRole);        // Actualizar rol por ID
router.delete('/:id', deleteRole);     // Eliminar rol por ID

export default router;

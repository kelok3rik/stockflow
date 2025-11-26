import { Router } from 'express';
import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
} from '../controllers/empresaController.js';

const router = Router();

// Rutas CRUD para empresa
router.get('/', getEmpresas);
router.get('/:id', getEmpresaById);
router.post('/', createEmpresa);
router.put('/:id', updateEmpresa);
router.delete('/:id', deleteEmpresa);

export default router;

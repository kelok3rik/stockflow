import { Router } from 'express';
import { 
  getMonedas,
  getMonedaById,
  createMoneda,
  updateMoneda,
  deleteMoneda
} from '../controllers/monedaController.js';

const router = Router();

// Rutas CRUD para monedas
router.get('/', getMonedas);
router.get('/:id', getMonedaById);
router.post('/', createMoneda);
router.put('/:id', updateMoneda);
router.delete('/:id', deleteMoneda);

export default router;

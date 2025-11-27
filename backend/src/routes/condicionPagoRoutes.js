import { Router } from 'express';
import { 
  getCondicionesPago,
  getCondicionPagoById,
  createCondicionPago,
  updateCondicionPago,
  deleteCondicionPago
} from '../controllers/condicionPagoController.js';

const router = Router();

// Rutas CRUD para condiciones de pago
router.get('/', getCondicionesPago);
router.get('/:id', getCondicionPagoById);
router.post('/', createCondicionPago);
router.put('/:id', updateCondicionPago);
router.delete('/:id', deleteCondicionPago);

export default router;

import { Router } from 'express';
import {
  getTiposMovimiento,
  getTipoMovimientoById,
  createTipoMovimiento,
  updateTipoMovimiento,
  deleteTipoMovimiento
} from '../controllers/tipoMovimientoController.js';

const router = Router();

router.get('/', getTiposMovimiento);
router.get('/:id', getTipoMovimientoById);
router.post('/', createTipoMovimiento);
router.put('/:id', updateTipoMovimiento);
router.delete('/:id', deleteTipoMovimiento);

export default router;

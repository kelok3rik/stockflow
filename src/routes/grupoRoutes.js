import { Router } from 'express';
import {
  getGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo
} from '../controllers/grupoController.js';

const router = Router();

router.get('/', getGrupos);
router.get('/:id', getGrupoById);
router.post('/', createGrupo);
router.put('/:id', updateGrupo);
router.delete('/:id', deleteGrupo);

export default router;

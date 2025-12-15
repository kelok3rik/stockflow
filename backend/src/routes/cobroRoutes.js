// backend/src/routes/cobroRoutes.js
import express from 'express';
import { listarCobros } from '../controllers/cobroController.js';

const router = express.Router();

// GET /api/cobros - Listar todos los cobros (el frontend aplicará los filtros)
router.get('/', listarCobros);

export default router;

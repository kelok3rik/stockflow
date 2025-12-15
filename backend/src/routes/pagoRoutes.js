// routes/pagoRoutes.js
import express from 'express';
import { listarPagos } from '../controllers/pagoController.js';

const router = express.Router();


router.get('/', listarPagos);

export default router;

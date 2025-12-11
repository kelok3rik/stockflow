// routes/compraRoutes.js
import express from 'express';
import {
  createCompra,
  getCompras,
  getCompraById,
  anularCompra
} from '../controllers/compraController.js';

const router = express.Router();

router.post('/', createCompra);           // crear compra
router.get('/', getCompras);              // listar (paginado)
router.get('/:id', getCompraById);        // detalle
router.post('/:id/anular', anularCompra); // anular compra

export default router;

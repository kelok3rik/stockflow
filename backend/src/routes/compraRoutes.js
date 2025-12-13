// routes/compraRoutes.js
import express from 'express';
import {
  createCompra,
  getCompras,
  getCompraById,
  anularCompra,
  pagarCompra,
  getComprasPendientes
} from '../controllers/compraController.js';

const router = express.Router();

router.post('/', createCompra);           // crear compra
router.get('/', getCompras);              // listar (paginado)
router.get('/:id', getCompraById);        // detalle
router.post('/:id/anular', anularCompra); // anular compra
router.post('/:id/pagar', pagarCompra);   // pagar compra
router.get('/pendientes/:proveedorId', getComprasPendientes); // compras pendientes por proveedor

export default router;

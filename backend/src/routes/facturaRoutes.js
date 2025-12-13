import express from 'express';
import { getFacturas, createFactura, getFacturasPendientes, abonarFactura } from '../controllers/facturaController.js';
const router = express.Router();

router.get('/', getFacturas);
router.get('/pendientes/:cliente_id', getFacturasPendientes);
router.post('/', createFactura);
router.post('/abonar', abonarFactura);

export default router;

// routes/devolucionRoutes.js
import express from "express";
import { getFacturaDetalles, createDevolucion, getDevoluciones } from "../controllers/devolucionController.js";

const router = express.Router();

router.get("/factura/:factura_id", getFacturaDetalles);
router.post("/", createDevolucion);
router.get("/", getDevoluciones);

export default router;

// routes/devolucionRoutes.js
import express from "express";
import { getFacturaDetalles, createDevolucion } from "../controllers/devolucionController.js";

const router = express.Router();

router.get("/factura/:factura_id", getFacturaDetalles);
router.post("/", createDevolucion);

export default router;

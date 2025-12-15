import express from "express";
import { createAjusteInventario, getAllMovimientosInventario } from "../controllers/movimientoInventarioController.js";

const router = express.Router();

router.post("/ajuste", createAjusteInventario);
router.get("/", getAllMovimientosInventario);

export default router;

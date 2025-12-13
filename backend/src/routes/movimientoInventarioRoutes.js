import express from "express";
import { createAjusteInventario } from "../controllers/movimientoInventarioController.js";

const router = express.Router();

router.post("/ajuste", createAjusteInventario);

export default router;

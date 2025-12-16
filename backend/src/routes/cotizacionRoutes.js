import express from "express";
import {
  crearCotizacion,
  listarCotizaciones,
  editarCotizacion,
  obtenerCotizacion,
  cancelarCotizacion,
  convertirCotizacionAFactura,

} from "../controllers/cotizacionController.js";

const router = express.Router();

router.post("/", crearCotizacion);
router.get("/", listarCotizaciones);
router.get("/:id", obtenerCotizacion);
router.put("/:id", editarCotizacion);
router.delete("/:id", cancelarCotizacion);
router.post("/:id/convertir", convertirCotizacionAFactura);

export default router;

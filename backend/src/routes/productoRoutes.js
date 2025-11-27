// routes/productoRoutes.js
import { Router } from "express";
import {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/productoController.js";

const router = Router();

// Crear producto
router.post("/", crearProducto);

// Listar todos los productos
router.get("/", obtenerProductos);

// Obtener un producto por ID
router.get("/:id", obtenerProductoPorId);

// Actualizar producto
router.put("/:id", actualizarProducto);

// Eliminar / Desactivar producto
router.delete("/:id", eliminarProducto);

export default router;

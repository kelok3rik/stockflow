// src/routes/proveedorRoutes.js
import { Router } from "express";
import {
    getProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor
} from "../controllers/proveedorController.js";

const router = Router();

router.get("/", getProveedores);
router.get("/:id", getProveedorById);
router.post("/", createProveedor);
router.put("/:id", updateProveedor);
router.delete("/:id", deleteProveedor);

export default router;

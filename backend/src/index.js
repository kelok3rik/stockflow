// src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Importar rutas
import usuarioRoutes from "./routes/usuarioRoutes.js";
import rolRoutes from "./routes/roleRoutes.js";
import departamentoRoutes from "./routes/departamentoRoutes.js";
import grupoRoutes from "./routes/grupoRoutes.js";
import almacenRoutes from "./routes/almacenRoutes.js";
import ubicacionRoutes from "./routes/ubicacionRoutes.js";
import tipoMovimientoRoutes from "./routes/tipoMovimientoRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import monedaRoutes from "./routes/monedaRoutes.js";
import condicionPagoRoutes from "./routes/condicionPagoRoutes.js";
import cotizacionRoutes from "./routes/cotizacionRoutes.js";
import facturaRoutes from "./routes/facturaRoutes.js";
import compraRoutes from "./routes/compraRoutes.js";
import movimientoInventarioRoutes from "./routes/movimientoInventarioRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// --------------------------
//       CORS - Permitir todos los orígenes
// --------------------------
app.use(cors()); // <--- esto permite cualquier origen

// --------------------------
//       RUTAS API
// --------------------------
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/departamentos", departamentoRoutes);
app.use("/api/grupos", grupoRoutes);
app.use("/api/almacenes", almacenRoutes);
app.use("/api/ubicaciones", ubicacionRoutes);
app.use("/api/tipos-movimiento", tipoMovimientoRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/monedas", monedaRoutes);
app.use("/api/condiciones-pago", condicionPagoRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/cotizaciones", cotizacionRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/movimientos-inventario", movimientoInventarioRoutes);

// --------------------------
//          SERVER
// --------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
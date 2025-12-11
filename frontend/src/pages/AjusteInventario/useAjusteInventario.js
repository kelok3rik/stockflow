// frontend/src/pages/AjusteInventario/useAjusteInventario.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useAjusteInventario() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/productos`);
        setProductos(res.data || []);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  // Registrar movimiento
  const registrarMovimiento = async ({ producto_id, tipo, cantidad, observacion }) => {
    if (!producto_id || !tipo || !cantidad || Number(cantidad) <= 0) {
      return { error: "Debe completar todos los campos correctamente." };
    }

    setLoading(true);

    try {
      const producto = productos.find(p => p.id_productos === Number(producto_id));
      if (!producto) throw new Error("Producto no encontrado");

      // Calcular nuevo stock
      let nuevoStock = producto.stock;
      if (tipo === "entrada") {
        nuevoStock += Number(cantidad);
      } else if (tipo === "salida") {
        if (Number(cantidad) > producto.stock) {
          setLoading(false);
          return { error: "No se puede sacar más stock del disponible." };
        }
        nuevoStock -= Number(cantidad);
      }

      // Enviar al backend
      const body = {
        producto_id: Number(producto_id),
        tipo,
        cantidad: Number(cantidad),
        observacion,
        stock_actual: nuevoStock,
      };

      const res = await axios.post(`${API_URL}/api/inventario/ajustes`, body);

      // Actualizar stock local y movimientos
      setProductos(prev =>
        prev.map(p =>
          p.id_productos === Number(producto_id) ? { ...p, stock: nuevoStock } : p
        )
      );

      const movimientoRegistrado = {
        ...body,
        producto_nombre: producto.nombre,
        fecha: new Date().toLocaleString(),
      };

      setMovimientos(prev => [...prev, movimientoRegistrado]);

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error(err);
      setLoading(false);
      return { error: err.message || "Error registrando movimiento" };
    }
  };

  return {
    productos,
    movimientos,
    loading,
    registrarMovimiento,
  };
}

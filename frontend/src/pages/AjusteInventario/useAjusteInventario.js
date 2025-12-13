import { useState, useEffect } from "react";
import axios from "axios";
import { generarDocumentoPDF } from "@/utils/generarFactura"; // 👈 IMPORTANTE

const API_URL = import.meta.env.VITE_API_URL;

export default function useAjusteInventario() {

  // ============================
  // ESTADOS
  // ============================
  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState(3); // 3 = AJUSTE_POS
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // 1. CARGAR PRODUCTOS
  // ============================
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/productos`);
        setProductos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      }
    };

    fetchProductos();
  }, []);

  // ============================
  // 2. AGREGAR DETALLE
  // ============================
  const agregarDetalle = () => {
    setDetalles(prev => [
      ...prev,
      {
        producto_id: "",
        cantidad: "",
        producto_nombre: ""
      }
    ]);
  };

  // ============================
  // 3. MODIFICAR DETALLE
  // ============================
  const modificarDetalle = (index, campo, valor) => {
    setDetalles(prev => {
      const copia = [...prev];
      copia[index][campo] = valor;

      if (campo === "producto_id") {
        const prod = productos.find(
          p => p.id_productos === Number(valor)
        );
        copia[index].producto_nombre = prod?.nombre || "";
      }

      return copia;
    });
  };

  // ============================
  // 4. ELIMINAR DETALLE
  // ============================
  const eliminarDetalle = (index) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  // ============================
  // 5. REGISTRAR AJUSTE + PDF
  // ============================
  const registrarAjuste = async (usuario_id) => {

    if (!usuario_id) {
      return { error: "Usuario no identificado." };
    }

    if (detalles.length === 0) {
      return { error: "Debe agregar al menos un producto." };
    }

    for (const d of detalles) {
      if (!d.producto_id || Number(d.cantidad) <= 0) {
        return { error: "Todos los productos deben tener cantidad válida." };
      }
    }

    const body = {
      usuario_id,
      tipo_movimiento_id: Number(tipoMovimiento), // 3 o 4
      referencia,
      detalles: detalles.map(d => ({
        producto_id: Number(d.producto_id),
        cantidad: Number(d.cantidad)
      }))
    };

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/movimientos/ajuste`,
        body
      );

      // ============================
      // GENERAR COMPROBANTE PDF
      // ============================
      generarDocumentoPDF({
        tipo: "Ajuste Inventario",
        numero_documento: res.data?.numero_documento || "AJUSTE",
        fecha: new Date().toLocaleString(),
        detalles: detalles.map(d => {
          const prod = productos.find(
            p => p.id_productos === Number(d.producto_id)
          );

          return {
            nombre: prod?.nombre || "Producto",
            cantidad: d.cantidad,
            precio_unitario: 0 // ajuste no maneja precio
          };
        }),
        total: 0
      });

      setLoading(false);

      // limpiar formulario
      setDetalles([]);
      setReferencia("");

      return { success: true, data: res.data };

    } catch (error) {
      console.error(error);
      setLoading(false);

      return {
        error:
          error.response?.data?.message ||
          "Error registrando ajuste de inventario"
      };
    }
  };

  // ============================
  // EXPORT
  // ============================
  return {
    productos,
    detalles,
    tipoMovimiento,
    referencia,
    loading,

    setTipoMovimiento,
    setReferencia,

    agregarDetalle,
    modificarDetalle,
    eliminarDetalle,
    registrarAjuste
  };
}

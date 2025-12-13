import { useState, useEffect } from "react";
import axios from "axios";
import { generarMovimientoPDF } from "../../utils/generarMovimiento"; 

const API_URL = import.meta.env.VITE_API_URL;

export default function useAjusteInventario() {
  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState(3);
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(false);

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

  const agregarDetalle = () => {
    setDetalles(prev => [
      ...prev,
      { producto_id: "", cantidad: "", producto_nombre: "" }
    ]);
  };

  const modificarDetalle = (index, campo, valor) => {
    setDetalles(prev => {
      const copia = [...prev];
      copia[index][campo] = campo === "producto_id" ? Number(valor) : valor;

      if (campo === "producto_id") {
        const prod = productos.find(p => p.id_productos === Number(valor));
        copia[index].producto_nombre = prod?.nombre || "N/D";
      }

      return copia;
    });
  };

  const eliminarDetalle = (index) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  const registrarAjuste = async (usuario_id, usuario_nombre = "Desconocido") => {
    if (!usuario_id) return { error: "Usuario no identificado." };
    if (detalles.length === 0) return { error: "Debe agregar al menos un producto." };
    for (const d of detalles) {
      if (!d.producto_id || Number(d.cantidad) <= 0)
        return { error: "Todos los productos deben tener cantidad válida." };
    }

    const body = {
      usuario_id,
      tipo_movimiento_id: Number(tipoMovimiento),
      referencia,
      detalles: detalles.map(d => ({
        producto_id: Number(d.producto_id),
        cantidad: Number(d.cantidad)
      }))
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/movimientos-inventario/ajuste`, body);

      generarMovimientoPDF({
        tipo: "Ajuste",
        numero_documento: res.data.numero_documento,
        fecha: new Date().toLocaleString(),
        usuario: usuario_nombre,
        detalles: detalles.map(d => {
          const prod = productos.find(p => p.id_productos === Number(d.producto_id));
          return {
            nombre: prod?.nombre || "N/D",
            cantidad: d.cantidad,
            movimiento: tipoMovimiento === 3 ? "AJUSTE POSITIVO" : "AJUSTE NEGATIVO"
          };
        })
      });

      setDetalles([]);
      setReferencia("");
      setLoading(false);

      return { success: true, data: res.data };
    } catch (error) {
      console.error(error);
      setLoading(false);
      return {
        error: error.response?.data?.message || "Error registrando ajuste de inventario"
      };
    }
  };

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

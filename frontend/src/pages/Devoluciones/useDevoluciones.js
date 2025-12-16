import { useState, useEffect } from "react";
import axios from "axios";
import { generarDocumentoPDF } from "../../utils/generarFactura";

const API_URL = import.meta.env.VITE_API_URL;

export default function useDevolucionFactura() {
  const [facturas, setFacturas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/facturas`);
        setFacturas(res.data);
        console.log("Facturas cargadas:", res.data);
      } catch (error) {
        console.error("Error cargando facturas:", error);
        setFacturas([]);
      }
    };
    fetchFacturas();
  }, []);

  const cargarDetallesFactura = async (factura_id) => {
    setSelectedFactura(factura_id);
    try {
      const res = await axios.get(`${API_URL}/api/devoluciones/factura/${factura_id}`);
      const data = res.data.map(d => ({
        ...d,
        cantidad_devuelta: 0
      }));
      setDetalles(data);
      
    } catch (error) {
      console.error("Error cargando detalles de factura:", error);
      setDetalles([]);
    }
  };

  const modificarDetalle = (index, cantidad) => {
    setDetalles(prev => {
      const copia = [...prev];
      copia[index].cantidad_devuelta = Number(cantidad);
      return copia;
    });
  };

  const registrarDevolucion = async (usuario_id, usuario_nombre = "Desconocido") => {
    if (!selectedFactura) return { error: "Seleccione una factura." };
    if (!usuario_id) return { error: "Usuario no identificado." };

    const devolucionDetalles = detalles
      .filter(d => d.cantidad_devuelta > 0)
      .map(d => ({
        factura_detalle_id: d.id_factura_detalle,
        producto_id: d.producto_id,
        cantidad: d.cantidad_devuelta,
        nombre: d.producto,
        precio_unitario: d.precio_unitario
      }));

    if (devolucionDetalles.length === 0) {
      return { error: "Debe seleccionar al menos un producto para devolver." };
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/devoluciones`, {
        factura_id: selectedFactura,
        usuario_id,
        detalles: devolucionDetalles
      });

      generarDocumentoPDF({
        tipo: "Devolución",
        numero_documento: res.data.numero_documento,
        fecha: new Date().toLocaleString(),
        usuario: usuario_nombre,
        detalles: devolucionDetalles.map(d => ({
          nombre: d.nombre || "N/D",
          cantidad: d.cantidad,
          movimiento: "DEVOLUCIÓN"
        }))
      });

      setDetalles([]);
      setSelectedFactura(null);
      setLoading(false);

      return { success: true, data: res.data };
    } catch (error) {
      console.error(error);
      setLoading(false);
      return {
        error: error.response?.data?.message || "Error registrando devolución."
      };
    }
  };

  return {
    facturas,
    detalles,
    selectedFactura,
    loading,
    setSelectedFactura,
    cargarDetallesFactura,
    modificarDetalle,
    registrarDevolucion
  };
}

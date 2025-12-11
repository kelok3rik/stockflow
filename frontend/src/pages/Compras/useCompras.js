import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // <-- importamos el context

const API_URL = import.meta.env.VITE_API_URL;

export default function useCompras() {
  const { user } = useAuth(); // obtenemos usuario logueado
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================
  // 🟦 GET: Obtener todas las compras
  // ==========================
  const fetchCompras = async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/compras?limit=${limit}&offset=${offset}`);
      setCompras(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar compras");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 🟩 POST: Crear compra
  // ==========================
  const createCompra = async ({ proveedor_id, detalles }) => {
    if (!user) throw { message: "Usuario no logueado." }; // validación
    if (!proveedor_id || !detalles || detalles.length === 0) {
      throw { message: "Faltan datos requeridos o detalles vacíos." };
    }

    try {
      setLoading(true);

      const numero_documento = `COMP-${Date.now()}`;

      const body = {
        numero_documento,
        proveedor_id: Number(proveedor_id),
        usuario_id: Number(user.id), // <-- usamos el usuario logueado
        detalles: detalles.map(d => ({
          producto_id: Number(d.producto_id),
          cantidad: Number(d.cantidad),
          costo_unitario: Number(d.costo_unitario)
        }))
      };

      console.log("Creando compra:", body);

      const { data } = await axios.post(`${API_URL}/api/compras`, body);
      await fetchCompras();
      return data;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 🟧 GET: Obtener compra por ID
  // ==========================
  const getCompraById = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/compras/${id}`);
      return data;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 🟥 DELETE / PATCH: Anular compra
  // ==========================
  const anularCompra = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.delete(`${API_URL}/api/compras/${id}`);
      await fetchCompras();
      return data;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Al cargar el hook → obtener compras
  // ==========================
  useEffect(() => {
    fetchCompras();
  }, []);

  return {
    compras,
    loading,
    error,
    fetchCompras,
    createCompra,
    getCompraById,
    anularCompra,
  };
}

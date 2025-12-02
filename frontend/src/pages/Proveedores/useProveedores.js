// src/pages/proveedores/useProveedores.js
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/proveedores`);
      setProveedores(res.data || []);
    } catch (error) {
      console.error("Error cargando proveedores", error);
    } finally {
      setLoading(false);
    }
  };

  const createProveedor = async (body) => {
    await axios.post(`${API_URL}/api/proveedores`, body);
    await load();
  };

  const updateProveedor = async (id, body) => {
    await axios.put(`${API_URL}/api/proveedores/${id}`, body);
    await load();
  };

  const deleteProveedor = async (id) => {
    await axios.delete(`${API_URL}/api/proveedores/${id}`);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { proveedores, createProveedor, updateProveedor, deleteProveedor, loading };
}

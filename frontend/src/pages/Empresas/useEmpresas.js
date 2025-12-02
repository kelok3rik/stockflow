// src/pages/empresas/useEmpresas.js
import { useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/empresas`;

export default function useEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setEmpresas(res.data || []);
    } catch (err) {
      console.error("Error cargando empresas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const createEmpresa = async (data) => {
    const res = await axios.post(API, data);
    setEmpresas(prev => [...prev, res.data]);
  };

  const updateEmpresa = async (id, data) => {
    const res = await axios.put(`${API}/${id}`, data);
    setEmpresas(prev =>
      prev.map(e => (e.id_empresa === id ? res.data : e))
    );
  };

  const deleteEmpresa = async (id) => {
    await axios.delete(`${API}/${id}`);
    setEmpresas(prev => prev.filter(e => e.id_empresa !== id));
  };

  return {
    empresas,
    loading,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
  };
}

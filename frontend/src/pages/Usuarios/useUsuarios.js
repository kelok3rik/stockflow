// src/pages/usuarios/useUsuarios.js
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/usuarios`);
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (body) => {
    await axios.post(`${API_URL}/api/usuarios`, body);
    await load();
  };

  const updateUsuario = async (id, body) => {
    await axios.put(`${API_URL}/api/usuarios/${id}`, body);
    await load();
  };

  const deleteUsuario = async (id) => {
    await axios.delete(`${API_URL}/api/usuarios/${id}`);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { usuarios, createUsuario, updateUsuario, deleteUsuario, loading };
}

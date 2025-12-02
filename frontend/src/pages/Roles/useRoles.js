// src/pages/roles/useRoles.js
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/roles`);
      setRoles(res.data || []);
    } catch (error) {
      console.error("Error cargando roles", error);
    } finally {
      setLoading(false);
    }
  };

  const createRol = async (data) => {
    const res = await axios.post(`${API_URL}/api/roles`, data);
    setRoles(prev => [...prev, res.data]);
  };

  const updateRol = async (id, data) => {
    const res = await axios.put(`${API_URL}/api/roles/${id}`, data);
    setRoles(prev => prev.map(r => r.id_roles === id ? res.data : r));
  };

  const deleteRol = async (id) => {
    await axios.delete(`${API_URL}/api/roles/${id}`);
    setRoles(prev => prev.filter(r => r.id_roles !== id));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, loading, createRol, updateRol, deleteRol };
}

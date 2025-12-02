// src/pages/usuarios/useUsuarios.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useUsuarios() {

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ========== FETCH GENERAL ==========
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchUsuarios();
    fetchRoles();
  };

  // ========== USUARIOS ==========
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/usuarios`);
      setUsuarios(data);
    } catch (error) {
      console.error("Error usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== ROLES ==========
  const fetchRoles = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/roles`);
      setRoles(data);
    } catch (error) {
      console.error("Error roles:", error);
    }
  };

  // ========== CRUD ==========
  const createUsuario = async (usuario) => {
    await axios.post(`${API_URL}/api/usuarios`, usuario);
    fetchUsuarios();
  };

  const updateUsuario = async (id, usuario) => {
    await axios.put(`${API_URL}/api/usuarios/${id}`, usuario);
    fetchUsuarios();
  };

  const deleteUsuario = async (id) => {
    await axios.delete(`${API_URL}/api/usuarios/${id}`);
    fetchUsuarios();
  };

  return {
    usuarios,
    roles,
    loading,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  };
}

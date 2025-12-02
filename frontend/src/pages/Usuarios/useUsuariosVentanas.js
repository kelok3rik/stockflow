import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useUsuariosVentanas() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/usuarios`);
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Actualizar permisos de un usuario
  const updatePermisos = async (usuarioId, permisos) => {
    try {
      setLoading(true);

      // Asegurarse de que permisos sea un objeto
      const payload = permisos || {};

      console.log("Actualizando permisos para usuario", usuarioId, payload);

      await axios.put(`${API_URL}/api/usuarios/${usuarioId}`, payload, {
        headers: { "Content-Type": "application/json" }
      });

      setUsuarios(prev =>
        prev.map(u =>
          u.id_usuarios === usuarioId ? { ...u, ...payload } : u
        )
      );
    } catch (error) {
      console.error("Error actualizando permisos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, loading, fetchUsuarios, updatePermisos };
}

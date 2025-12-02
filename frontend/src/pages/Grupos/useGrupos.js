import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useGrupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const [gruposRes, departamentosRes] = await Promise.all([
        axios.get(`${API_URL}/api/grupos`),
        axios.get(`${API_URL}/api/departamentos`)
      ]);

      const departamentos = departamentosRes.data || [];

      // Mapa id -> nombre
      const deptoMap = {};
      departamentos.forEach(d => {
        deptoMap[d.id_departamentos] = d.nombre;
      });

      // Enriquecer grupos
      const data = (gruposRes.data || []).map(g => ({
        ...g,
        departamento_nombre: deptoMap[g.departamento_id] || "Sin asignar"
      }));

      setGrupos(data);

    } catch (error) {
      console.error("Error cargando grupos", error);
    } finally {
      setLoading(false);
    }
  };

  const createGrupo = async (body) => {
    await axios.post(`${API_URL}/api/grupos`, body);
    await load();
  };

  const updateGrupo = async (id, body) => {
    await axios.put(`${API_URL}/api/grupos/${id}`, body);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { grupos, createGrupo, updateGrupo, loading };
}

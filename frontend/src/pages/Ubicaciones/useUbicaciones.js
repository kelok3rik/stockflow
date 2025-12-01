import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);

  const load = async () => {
    const { data } = await axios.get(`${API_URL}/api/ubicaciones`);
    setUbicaciones(data || []);
  };

  const createUbicacion = async (body) => {
    await axios.post(`${API_URL}/api/ubicaciones`, body);
    await load();
  };

  const updateUbicacion = async (id, body) => {
    await axios.put(`${API_URL}/api/ubicaciones/${id}`, body);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { ubicaciones, createUbicacion, updateUbicacion };
}

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useTiposMovimiento() {
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await axios.get(`${API_URL}/api/tipos-movimiento`);
    setTiposMovimiento(data || []);
    setLoading(false);
  };

  const createTipo = async (body) => {
    await axios.post(`${API_URL}/api/tipos-movimiento`, body);
    await load();
  };

  const updateTipo = async (id, body) => {
    await axios.put(`${API_URL}/api/tipos-movimiento/${id}`, body);
    await load();
  };

  useEffect(() => { load(); }, []);

  return { tiposMovimiento, createTipo, updateTipo, loading };
}

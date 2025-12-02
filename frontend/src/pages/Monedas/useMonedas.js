// src/pages/Monedas/useMonedas.js
import { useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/monedas`;


export default function useMonedas() {
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMonedas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setMonedas(res.data);
    } catch (err) {
      console.error("Error al cargar monedas", err);
    } finally {
      setLoading(false);
    }
  };

  const createMoneda = async (data) => {
    await axios.post(API, data);
    await getMonedas();
  };

  const updateMoneda = async (id, data) => {
    await axios.put(`${API}/${id}`, data);
    await getMonedas();
  };

  const deleteMoneda = async (id) => {
    await axios.delete(`${API}/${id}`);
    await getMonedas();
  };

  useEffect(() => {
    getMonedas();
  }, []);

  return {
    monedas,
    loading,
    createMoneda,
    updateMoneda,
    deleteMoneda,
    reload: getMonedas,
  };
}

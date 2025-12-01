// src/pages/almacenes/useAlmacenes.js
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function useAlmacenes() {
  const [almacenes, setAlmacenes] = useState([]);

  const cargar = async () => {
    const res = await axios.get(`${API}/api/almacenes`);
    setAlmacenes(res.data || []);
  };

  useEffect(() => {
    cargar();
  }, []);

  const createAlmacen = async (data) => {
    await axios.post(`${API}/api/almacenes`, data);
    await cargar();
  };

  const updateAlmacen = async (id, data) => {
    await axios.put(`${API}/api/almacenes/${id}`, data);
    await cargar();
  };

  return { almacenes, createAlmacen, updateAlmacen };
}

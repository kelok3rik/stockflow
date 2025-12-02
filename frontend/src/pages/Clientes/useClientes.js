import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/clientes`);
      setClientes(data || []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (body) => {
    try {
      await axios.post(`${API_URL}/api/clientes`, body);
      await load();
    } catch (error) {
      console.error("Error creando cliente:", error);
      throw error;
    }
  };

  const updateCliente = async (id, body) => {
    try {
      await axios.put(`${API_URL}/api/clientes/${id}`, body);
      await load();
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      throw error;
    }
  };

  const deleteCliente = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/clientes/${id}`);
      await load();
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      throw error;
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { clientes, loading, createCliente, updateCliente, deleteCliente };
}

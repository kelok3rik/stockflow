import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);

  const load = async () => {
    const { data } = await axios.get(`${API_URL}/api/departamentos`);
    setDepartamentos(data || []);
  };

  const createDepartamento = async (body) => {
    await axios.post(`${API_URL}/api/departamentos`, body);
    await load();
  };

  const updateDepartamento = async (id, body) => {
    await axios.put(`${API_URL}/api/departamentos/${id}`, body);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    departamentos,
    createDepartamento,
    updateDepartamento
  };
}

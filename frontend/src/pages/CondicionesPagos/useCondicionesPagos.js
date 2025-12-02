import { useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/condiciones-pago`;

export default function useCondicionesPago() {
  const [condiciones, setCondiciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCondiciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setCondiciones(res.data || []);
    } catch (err) {
      console.error("Error cargando condiciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondiciones();
  }, []);

  const createCondicion = async (data) => {
    const res = await axios.post(API, data);
    setCondiciones(prev => [res.data, ...prev]);
  };

  const updateCondicion = async (id, data) => {
    await axios.put(`${API}/${id}`, data);
    setCondiciones(prev =>
      prev.map(c =>
        c.id_condiciones_pago === id ? { ...c, ...data } : c
      )
    );
  };

  return {
    condiciones,
    loading,
    fetchCondiciones,
    createCondicion,
    updateCondicion
  };
}

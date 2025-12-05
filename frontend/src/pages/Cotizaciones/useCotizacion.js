import { useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function useCotizacion() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCotizaciones = async () => {
    const res = await axios.get(`${API}/cotizaciones`);
    setCotizaciones(res.data);
  };

  const getClientes = async () => {
    const res = await axios.get(`${API}/clientes`);
    setClientes(res.data);
  };

  const getProductos = async () => {
    const res = await axios.get(`${API}/productos`);
    setProductos(res.data);
  };

  const createCotizacion = async (data) => {
    await axios.post(`${API}/cotizaciones`, data);
    getCotizaciones();
  };

  const deleteCotizacion = async (id) => {
    await axios.delete(`${API}/cotizaciones/${id}`);
    getCotizaciones();
  };

  useEffect(() => {
    getCotizaciones();
    getClientes();
    getProductos();
  }, []);

  return {
    cotizaciones,
    clientes,
    productos,
    createCotizacion,
    deleteCotizacion,
    loading
  };
}

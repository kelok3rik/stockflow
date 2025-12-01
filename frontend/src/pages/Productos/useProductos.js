// src/pages/productos/useProductos.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useProductos() {

  const [productos, setProductos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // ========== FETCH GENERAL ==========
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchProductos();
    fetchDepartamentos();
    fetchGrupos();
    fetchUbicaciones();
  };

  // ========== PRODUCTOS ==========
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/productos`);
      setProductos(data);
    } catch (error) {
      console.error("Error productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== SELECTS ==========
  const fetchDepartamentos = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/departamentos`);
      setDepartamentos(data);
    } catch (error) {
      console.error("Error departamentos:", error);
    }
  };

  const fetchGrupos = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/grupos`);
      setGrupos(data);
    } catch (error) {
      console.error("Error grupos:", error);
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/ubicaciones`);
      setUbicaciones(data);
    } catch (error) {
      console.error("Error ubicaciones:", error);
    }
  };

  // ========== CRUD ==========
  const createProducto = async (producto) => {
    await axios.post(`${API_URL}/api/productos`, producto);
    fetchProductos();
  };

  const updateProducto = async (id, producto) => {
    await axios.put(`${API_URL}/api/productos/${id}`, producto);
    fetchProductos();
  };

  const deleteProducto = async (id) => {
    await axios.delete(`${API_URL}/api/productos/${id}`);
    fetchProductos();
  };

  return {
    productos,
    departamentos,
    grupos,
    ubicaciones,
    loading,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}

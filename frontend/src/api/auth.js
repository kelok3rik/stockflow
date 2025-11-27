import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (usuario, clave) => {
  const res = await axios.post(`${API_URL}/api/usuarios/login`, { usuario, clave });
  console.log(res.data); // <--- agregar esto temporalmente para depurar
  return res.data;
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const getPedidos = async (estado) => {
  const url = estado ? `${API_URL}/pedidos?estado=${estado}` : `${API_URL}/pedidos`;
  const response = await axios.get(url, { headers: getAuthHeader() });
  return response.data;
};

export const createPedido = async (pedido) => {
  const response = await axios.post(`${API_URL}/pedidos`, pedido, { headers: getAuthHeader() });
  return response.data;
};

export const updatePedido = async (id, pedido) => {
  const response = await axios.put(`${API_URL}/pedidos/${id}`, pedido, { headers: getAuthHeader() });
  return response.data;
};

export const deletePedido = async (id) => {
  await axios.delete(`${API_URL}/pedidos/${id}`, { headers: getAuthHeader() });
};

export const getPromedio = async () => {
  const response = await axios.get(`${API_URL}/pedidos/promedio`, { headers: getAuthHeader() });
  return response.data;
};

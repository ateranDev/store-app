import api from './axios';

export const getVentas = async () => {
  const { data } = await api.get('/ventas');
  return data;
};

export const getVenta = async (id) => {
  const { data } = await api.get(`/ventas/${id}`);
  return data;
};

export const createVenta = async (venta) => {
  const { data } = await api.post('/ventas', venta);
  return data;
};
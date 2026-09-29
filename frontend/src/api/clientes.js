import api from './axios';

export const getClientes = async () => {
  const { data } = await api.get('/clientes');
  return data;
};

export const createCliente = async (cliente) => {
  const { data } = await api.post('/clientes', cliente);
  return data;
};

export const updateCliente = async (id, cliente) => {
  const { data } = await api.put(`/clientes/${id}`, cliente);
  return data;
};

export const deleteCliente = async (id) => {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
};

export const getDeudaTotalCliente = async (clienteId) => {
  const { data } = await api.get(`/deudas/cliente/${clienteId}/total`);
  return data;
};
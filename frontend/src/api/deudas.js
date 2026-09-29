import api from './axios';

export const getDeudasPendientes = async () => {
  const { data } = await api.get('/deudas');
  return data;
};

export const getAbonosPorDeuda = async (deudaId) => {
  const { data } = await api.get(`/deudas/${deudaId}/abonos`);
  return data;
};

export const crearAbono = async (deudaId, monto) => {
  const { data } = await api.post(`/deudas/${deudaId}/abonos`, { monto });
  return data;
};
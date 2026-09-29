import api from './axios';

export const getResumen = async (fecha_inicio, fecha_fin) => {
  const { data } = await api.get('/reportes/resumen', {
    params: { fecha_inicio, fecha_fin },
  });
  return data;
};

export const getGananciasPorVenta = async (fecha_inicio, fecha_fin) => {
  const { data } = await api.get('/reportes/ganancias', {
    params: { fecha_inicio, fecha_fin },
  });
  return data;
};

export const exportarExcel = async (fecha_inicio, fecha_fin) => {
  const response = await api.get('/reportes/exportar-excel', {
    params: { fecha_inicio, fecha_fin },
    responseType: 'blob', // 👈 clave: le decimos a axios que espere un archivo binario, no JSON
  });
  return response.data;
};
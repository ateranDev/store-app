import * as DeudaModel from '../models/deudaModel.js';

export const getDeudas = async (req, res) => {
  try {
    const deudas = await DeudaModel.getDeudasPendientes();
    res.json(deudas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las deudas' });
  }
};

export const getDeudaTotal = async (req, res) => {
  try {
    const total = await DeudaModel.getDeudaTotalCliente(req.params.clienteId);
    res.json({ cliente_id: Number(req.params.clienteId), deuda_total: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular la deuda total' });
  }
};

export const getDeudasCliente = async (req, res) => {
  try {
    const deudas = await DeudaModel.getDeudasPorCliente(req.params.clienteId);
    res.json(deudas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las deudas del cliente' });
  }
};

export const postAbono = async (req, res) => {
  try {
    const { monto } = req.body;
    const { deudaId } = req.params;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'El monto del abono debe ser mayor a 0' });
    }

    const resultado = await DeudaModel.crearAbono(deudaId, monto);
    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getAbonos = async (req, res) => {
  try {
    const abonos = await DeudaModel.getAbonosPorDeuda(req.params.deudaId);
    res.json(abonos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los abonos' });
  }
};
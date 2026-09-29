import * as VentaModel from '../models/ventaModel.js';

export const postVenta = async (req, res) => {
  try {
    const { cliente_id, productos, monto_pagado, fecha_vencimiento } = req.body;

    if (!cliente_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        error: 'cliente_id y un arreglo de productos (con producto_id y cantidad) son obligatorios',
      });
    }

    const resultado = await VentaModel.crearVentaTransaccion({
      cliente_id,
      productos,
      monto_pagado,
      fecha_vencimiento,
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getVentas = async (req, res) => {
  try {
    const ventas = await VentaModel.getAllVentas();
    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

export const getVenta = async (req, res) => {
  try {
    const venta = await VentaModel.getVentaById(req.params.id);
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.json(venta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};
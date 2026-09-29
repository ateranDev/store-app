import * as ClienteModel from '../models/clienteModel.js';

export const getClientes = async (req, res) => {
  try {
    const clientes = await ClienteModel.getAllClientes();
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
};

export const getCliente = async (req, res) => {
  try {
    const cliente = await ClienteModel.getClienteById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
};

export const postCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const nuevoCliente = await ClienteModel.createCliente({ nombre, telefono, direccion });
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

export const putCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;

    const clienteActualizado = await ClienteModel.updateCliente(req.params.id, {
      nombre,
      telefono,
      direccion,
    });

    if (!clienteActualizado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(clienteActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

export const deleteClienteController = async (req, res) => {
  try {
    const clienteEliminado = await ClienteModel.deleteCliente(req.params.id);
    if (!clienteEliminado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado correctamente', cliente: clienteEliminado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};
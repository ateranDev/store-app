import * as ProductoModel from '../models/productoModel.js';

export const getProductos = async (req, res) => {
  try {
    const productos = await ProductoModel.getAllProductos();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

export const getProducto = async (req, res) => {
  try {
    const producto = await ProductoModel.getProductoById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

export const postProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_costo, precio_venta, stock } = req.body;

    // Validación básica
    if (!nombre || precio_costo == null || precio_venta == null) {
      return res.status(400).json({ error: 'nombre, precio_costo y precio_venta son obligatorios' });
    }

    const nuevoProducto = await ProductoModel.createProducto({
      nombre,
      descripcion,
      precio_costo,
      precio_venta,
      stock: stock ?? 0,
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

export const putProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_costo, precio_venta, stock } = req.body;

    const productoActualizado = await ProductoModel.updateProducto(req.params.id, {
      nombre,
      descripcion,
      precio_costo,
      precio_venta,
      stock,
    });

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(productoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

export const deleteProductoController = async (req, res) => {
  try {
    const productoEliminado = await ProductoModel.deleteProducto(req.params.id);
    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente', producto: productoEliminado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
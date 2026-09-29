import pool from '../config/db.js';

// Obtener todos los productos
export const getAllProductos = async () => {
  const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
  return result.rows;
};

// Obtener un producto por id
export const getProductoById = async (id) => {
  const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
  return result.rows[0]; // undefined si no existe
};

// Crear un producto
export const createProducto = async ({ nombre, descripcion, precio_costo, precio_venta, stock }) => {
  const result = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio_costo, precio_venta, stock)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, descripcion, precio_costo, precio_venta, stock]
  );
  return result.rows[0];
};

// Actualizar un producto
export const updateProducto = async (id, { nombre, descripcion, precio_costo, precio_venta, stock }) => {
  const result = await pool.query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, precio_costo = $3, precio_venta = $4, stock = $5
     WHERE id = $6
     RETURNING *`,
    [nombre, descripcion, precio_costo, precio_venta, stock, id]
  );
  return result.rows[0];
};

// Eliminar un producto
export const deleteProducto = async (id) => {
  const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
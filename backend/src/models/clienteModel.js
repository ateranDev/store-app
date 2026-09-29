import pool from '../config/db.js';

export const getAllClientes = async () => {
  const result = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
  return result.rows;
};

export const getClienteById = async (id) => {
  const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
  return result.rows[0];
};

export const createCliente = async ({ nombre, telefono, direccion }) => {
  const result = await pool.query(
    `INSERT INTO clientes (nombre, telefono, direccion)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nombre, telefono, direccion]
  );
  return result.rows[0];
};

export const updateCliente = async (id, { nombre, telefono, direccion }) => {
  const result = await pool.query(
    `UPDATE clientes
     SET nombre = $1, telefono = $2, direccion = $3
     WHERE id = $4
     RETURNING *`,
    [nombre, telefono, direccion, id]
  );
  return result.rows[0];
};

export const deleteCliente = async (id) => {
  const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
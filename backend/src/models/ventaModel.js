import pool from '../config/db.js';

export const crearVentaTransaccion = async ({ cliente_id, productos, monto_pagado, fecha_vencimiento }) => {
  // productos = [{ producto_id, cantidad }, ...]

  const client = await pool.connect(); // sacamos UNA conexión del pool para toda la transacción

  try {
    await client.query('BEGIN');

    let total = 0;
    const detalles = [];

    // 1. Validar stock y calcular el total
    for (const item of productos) {
      const { rows } = await client.query(
        'SELECT * FROM productos WHERE id = $1 FOR UPDATE', // FOR UPDATE bloquea la fila para evitar condiciones de carrera
        [item.producto_id]
      );
      const producto = rows[0];

      if (!producto) {
        throw new Error(`Producto con id ${item.producto_id} no existe`);
      }
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`);
      }

      const subtotal = producto.precio_venta * item.cantidad;
      total += subtotal;

      detalles.push({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio_venta,
        costo_unitario: producto.precio_costo,
      });
    }

    const pagado = monto_pagado ?? 0;
    const fiado = total - pagado;

    if (fiado < 0) {
      throw new Error('El monto pagado no puede ser mayor al total de la venta');
    }

    // 2. Insertar la cabecera de la venta
    const ventaResult = await client.query(
      `INSERT INTO ventas (cliente_id, total, monto_pagado, monto_fiado)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cliente_id, total, pagado, fiado]
    );
    const venta = ventaResult.rows[0];

    // 3. Insertar detalle y descontar stock, producto por producto
    for (const d of detalles) {
      await client.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, costo_unitario)
         VALUES ($1, $2, $3, $4, $5)`,
        [venta.id, d.producto_id, d.cantidad, d.precio_unitario, d.costo_unitario]
      );

      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
        [d.cantidad, d.producto_id]
      );
    }

    // 4. Si quedó algo fiado, crear la deuda
    let deuda = null;
    if (fiado > 0) {
      const deudaResult = await client.query(
        `INSERT INTO deudas (venta_id, cliente_id, monto_original, monto_pendiente, fecha_vencimiento)
         VALUES ($1, $2, $3, $3, $4)
         RETURNING *`,
        [venta.id, cliente_id, fiado, fecha_vencimiento || null]
      );
      deuda = deudaResult.rows[0];
    }

    await client.query('COMMIT'); // todo salió bien, confirmamos

    return { venta, detalles, deuda };

  } catch (error) {
    await client.query('ROLLBACK'); // algo falló, deshacemos TODO
    throw error;
  } finally {
    client.release(); // devolvemos la conexión al pool, pase lo que pase
  }
};

export const getAllVentas = async () => {
  const result = await pool.query(
    `SELECT v.*, c.nombre AS cliente_nombre
     FROM ventas v
     JOIN clientes c ON c.id = v.cliente_id
     ORDER BY v.fecha DESC`
  );
  return result.rows;
};

export const getVentaById = async (id) => {
  const ventaResult = await pool.query(
    `SELECT v.*, c.nombre AS cliente_nombre
     FROM ventas v
     JOIN clientes c ON c.id = v.cliente_id
     WHERE v.id = $1`,
    [id]
  );
  const venta = ventaResult.rows[0];
  if (!venta) return null;

  const detalleResult = await pool.query(
    `SELECT dv.*, p.nombre AS producto_nombre
     FROM detalle_ventas dv
     JOIN productos p ON p.id = dv.producto_id
     WHERE dv.venta_id = $1`,
    [id]
  );

  return { ...venta, detalles: detalleResult.rows };
};
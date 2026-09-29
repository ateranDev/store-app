import pool from '../config/db.js';

// Todas las deudas pendientes (vista general)
export const getDeudasPendientes = async () => {
  const result = await pool.query(
    `SELECT d.*, c.nombre AS cliente_nombre, v.fecha AS fecha_venta
     FROM deudas d
     JOIN clientes c ON c.id = d.cliente_id
     JOIN ventas v ON v.id = d.venta_id
     WHERE d.estado = 'pendiente'
     ORDER BY d.fecha_vencimiento ASC NULLS LAST`
  );
  return result.rows;
};

// Deuda total de un cliente (un solo número)
export const getDeudaTotalCliente = async (cliente_id) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(monto_pendiente), 0) AS deuda_total
     FROM deudas
     WHERE cliente_id = $1 AND estado = 'pendiente'`,
    [cliente_id]
  );
  return Number(result.rows[0].deuda_total);
};

// Detalle de todas las deudas (pendientes y pagadas) de un cliente
export const getDeudasPorCliente = async (cliente_id) => {
  const result = await pool.query(
    `SELECT d.*, v.fecha AS fecha_venta
     FROM deudas d
     JOIN ventas v ON v.id = d.venta_id
     WHERE d.cliente_id = $1
     ORDER BY d.fecha_creacion DESC`,
    [cliente_id]
  );
  return result.rows;
};

// Obtener una deuda por id (para validar antes de abonar)
export const getDeudaById = async (id) => {
  const result = await pool.query('SELECT * FROM deudas WHERE id = $1', [id]);
  return result.rows[0];
};

// Registrar un abono (transacción)
export const crearAbono = async (deuda_id, monto) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM deudas WHERE id = $1 FOR UPDATE',
      [deuda_id]
    );
    const deuda = rows[0];

    if (!deuda) {
      throw new Error('La deuda no existe');
    }
    if (deuda.estado === 'pagada') {
      throw new Error('Esta deuda ya está pagada por completo');
    }
    if (monto > deuda.monto_pendiente) {
      throw new Error(`El abono ($${monto}) no puede ser mayor a la deuda pendiente ($${deuda.monto_pendiente})`);
    }

    // 1. Insertar el abono
    const abonoResult = await client.query(
      `INSERT INTO abonos (deuda_id, monto) VALUES ($1, $2) RETURNING *`,
      [deuda_id, monto]
    );

    // 2. Actualizar el monto pendiente de la deuda
    const nuevoPendiente = Number(deuda.monto_pendiente) - Number(monto);
    const nuevoEstado = nuevoPendiente <= 0 ? 'pagada' : 'pendiente';

    const deudaActualizada = await client.query(
      `UPDATE deudas SET monto_pendiente = $1, estado = $2 WHERE id = $3 RETURNING *`,
      [nuevoPendiente, nuevoEstado, deuda_id]
    );

    await client.query('COMMIT');

    return { abono: abonoResult.rows[0], deuda: deudaActualizada.rows[0] };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Historial de abonos de una deuda específica
export const getAbonosPorDeuda = async (deuda_id) => {
  const result = await pool.query(
    'SELECT * FROM abonos WHERE deuda_id = $1 ORDER BY fecha ASC',
    [deuda_id]
  );
  return result.rows;
};
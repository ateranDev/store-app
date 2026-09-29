import pool from '../config/db.js';

// Resumen general: total vendido, ganancia total y cantidad de ventas en un rango de fechas
export const getResumenGanancias = async (fecha_inicio, fecha_fin) => {
  const result = await pool.query(
    `SELECT
        COUNT(DISTINCT v.id) AS cantidad_ventas,
        COALESCE(SUM(v.total), 0) AS total_vendido,
        COALESCE(SUM(dv.cantidad * (dv.precio_unitario - dv.costo_unitario)), 0) AS ganancia_total
     FROM ventas v
     JOIN detalle_ventas dv ON dv.venta_id = v.id
     WHERE v.fecha BETWEEN $1 AND $2`,
    [fecha_inicio, fecha_fin]
  );
  return result.rows[0];
};

// Ganancia detallada, venta por venta, en un rango de fechas
export const getGananciasPorVenta = async (fecha_inicio, fecha_fin) => {
  const result = await pool.query(
    `SELECT
        v.id AS venta_id,
        v.fecha,
        c.nombre AS cliente_nombre,
        v.total,
        SUM(dv.cantidad * (dv.precio_unitario - dv.costo_unitario)) AS ganancia
     FROM ventas v
     JOIN clientes c ON c.id = v.cliente_id
     JOIN detalle_ventas dv ON dv.venta_id = v.id
     WHERE v.fecha BETWEEN $1 AND $2
     GROUP BY v.id, v.fecha, c.nombre, v.total
     ORDER BY v.fecha DESC`,
    [fecha_inicio, fecha_fin]
  );
  return result.rows;
};

// Ganancia de UNA venta específica (detalle producto por producto)
export const getGananciaDeVenta = async (venta_id) => {
  const result = await pool.query(
    `SELECT
        dv.producto_id,
        p.nombre AS producto_nombre,
        dv.cantidad,
        dv.precio_unitario,
        dv.costo_unitario,
        (dv.precio_unitario - dv.costo_unitario) AS ganancia_unitaria,
        (dv.cantidad * (dv.precio_unitario - dv.costo_unitario)) AS ganancia_subtotal
     FROM detalle_ventas dv
     JOIN productos p ON p.id = dv.producto_id
     WHERE dv.venta_id = $1`,
    [venta_id]
  );
  return result.rows;
};

// Ventas filtradas por rango de fechas (con o sin filtro)
export const getVentasPorFecha = async (fecha_inicio, fecha_fin) => {
  const result = await pool.query(
    `SELECT v.*, c.nombre AS cliente_nombre
     FROM ventas v
     JOIN clientes c ON c.id = v.cliente_id
     WHERE v.fecha BETWEEN $1 AND $2
     ORDER BY v.fecha DESC`,
    [fecha_inicio, fecha_fin]
  );
  return result.rows;
};

// Clientes que compraron en un rango de fechas, con los productos que llevaron
export const getComprasClientesPorMes = async (fecha_inicio, fecha_fin) => {
  const result = await pool.query(
    `SELECT
        c.id AS cliente_id,
        c.nombre,
        c.telefono,
        p.nombre AS producto_nombre,
        SUM(dv.cantidad) AS cantidad_total
     FROM ventas v
     JOIN clientes c ON c.id = v.cliente_id
     JOIN detalle_ventas dv ON dv.venta_id = v.id
     JOIN productos p ON p.id = dv.producto_id
     WHERE v.fecha BETWEEN $1 AND $2
     GROUP BY c.id, c.nombre, c.telefono, p.nombre
     ORDER BY c.nombre ASC, p.nombre ASC`,
    [fecha_inicio, fecha_fin]
  );
  return result.rows;
};
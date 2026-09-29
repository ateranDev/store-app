import ExcelJS from 'exceljs';
import * as ReporteModel from '../models/reporteModel.js';
import { getDeudaTotalCliente } from '../models/deudaModel.js';

// Función auxiliar: si no mandan fechas, usamos "desde siempre hasta ahora"
const normalizarFechas = (fecha_inicio, fecha_fin) => {
  const inicio = fecha_inicio ? `${fecha_inicio} 00:00:00` : '1900-01-01 00:00:00';
  const fin = fecha_fin ? `${fecha_fin} 23:59:59` : '2999-12-31 23:59:59';
  return { inicio, fin };
};

export const getResumen = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const { inicio, fin } = normalizarFechas(fecha_inicio, fecha_fin);

    const resumen = await ReporteModel.getResumenGanancias(inicio, fin);
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el resumen de ganancias' });
  }
};

export const getGananciasVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const { inicio, fin } = normalizarFechas(fecha_inicio, fecha_fin);

    const ganancias = await ReporteModel.getGananciasPorVenta(inicio, fin);
    res.json(ganancias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ganancias por venta' });
  }
};

export const getGananciaVenta = async (req, res) => {
  try {
    const detalle = await ReporteModel.getGananciaDeVenta(req.params.ventaId);
    res.json(detalle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la ganancia de la venta' });
  }
};

export const getVentasFecha = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const { inicio, fin } = normalizarFechas(fecha_inicio, fecha_fin);

    const ventas = await ReporteModel.getVentasPorFecha(inicio, fin);
    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al filtrar las ventas por fecha' });
  }
};

export const exportarExcel = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'fecha_inicio y fecha_fin son obligatorios' });
    }

    const inicio = `${fecha_inicio} 00:00:00`;
    const fin = `${fecha_fin} 23:59:59`;

    const filas = await ReporteModel.getComprasClientesPorMes(inicio, fin);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'No hay compras registradas en ese período' });
    }

    // 1. Agrupar las filas por cliente
    const clientesMap = new Map();

    for (const fila of filas) {
      if (!clientesMap.has(fila.cliente_id)) {
        clientesMap.set(fila.cliente_id, {
          nombre: fila.nombre,
          telefono: fila.telefono || '—',
          productos: [],
        });
      }
      clientesMap.get(fila.cliente_id).productos.push(
        `${fila.producto_nombre} x${fila.cantidad_total}`
      );
    }

    // 2. Para cada cliente, buscar su deuda pendiente actual
    const clientesFinal = [];
    for (const [clienteId, datos] of clientesMap) {
      const deuda_total = await getDeudaTotalCliente(clienteId);
      clientesFinal.push({
        nombre: datos.nombre,
        telefono: datos.telefono,
        productos: datos.productos.join(', '),
        deuda_total,
      });
    }

    // 3. Armar el archivo Excel
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet('Reporte mensual');

    hoja.columns = [
      { header: 'Cliente', key: 'nombre', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Productos comprados', key: 'productos', width: 50 },
      { header: 'Deuda pendiente', key: 'deuda_total', width: 18 },
    ];

    // Estilo del encabezado
    hoja.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hoja.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }, // verde, el mismo tono de tu interfaz
    };

    // Filas de datos
    clientesFinal.forEach((c) => {
      hoja.addRow(c);
    });

    // Formato de moneda en la columna de deuda
    hoja.getColumn('deuda_total').numFmt = '"$"#,##0.00';

    // 4. Enviar el archivo como descarga
    const nombreArchivo = `reporte_${fecha_inicio}_a_${fecha_fin}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte de Excel' });
  }
};
import { Router } from 'express';
import { getResumen, getGananciasVentas, getGananciaVenta, getVentasFecha, exportarExcel } from '../controllers/reporteController.js';

const router = Router();

router.get('/resumen', getResumen);                  // GET /api/reportes/resumen?fecha_inicio=...&fecha_fin=...
router.get('/ganancias', getGananciasVentas);         // GET /api/reportes/ganancias?fecha_inicio=...&fecha_fin=...
router.get('/exportar-excel', exportarExcel);
router.get('/ganancias/:ventaId', getGananciaVenta);  // GET /api/reportes/ganancias/5
router.get('/ventas', getVentasFecha);                // GET /api/reportes/ventas?fecha_inicio=...&fecha_fin=...

export default router;
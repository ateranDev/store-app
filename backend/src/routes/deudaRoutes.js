import { Router } from 'express';
import {
  getDeudas,
  getDeudaTotal,
  getDeudasCliente,
  postAbono,
  getAbonos,
} from '../controllers/deudaController.js';

const router = Router();

router.get('/', getDeudas);                              // GET  /api/deudas  -> todas las pendientes
router.get('/cliente/:clienteId/total', getDeudaTotal);   // GET  /api/deudas/cliente/1/total
router.get('/cliente/:clienteId', getDeudasCliente);      // GET  /api/deudas/cliente/1
router.post('/:deudaId/abonos', postAbono);               // POST /api/deudas/5/abonos
router.get('/:deudaId/abonos', getAbonos);                // GET  /api/deudas/5/abonos

export default router;
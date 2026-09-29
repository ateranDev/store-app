import { Router } from 'express';
import { postVenta, getVentas, getVenta } from '../controllers/ventaController.js';

const router = Router();

router.post('/', postVenta);
router.get('/', getVentas);
router.get('/:id', getVenta);

export default router;
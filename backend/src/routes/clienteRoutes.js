import { Router } from 'express';
import {
  getClientes,
  getCliente,
  postCliente,
  putCliente,
  deleteClienteController,
} from '../controllers/clienteController.js';

const router = Router();

router.get('/', getClientes);
router.get('/:id', getCliente);
router.post('/', postCliente);
router.put('/:id', putCliente);
router.delete('/:id', deleteClienteController);

export default router;
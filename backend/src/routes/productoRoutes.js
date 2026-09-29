import { Router } from 'express';
import {
  getProductos,
  getProducto,
  postProducto,
  putProducto,
  deleteProductoController,
} from '../controllers/productoController.js';

const router = Router();

router.get('/', getProductos);          // GET    /api/productos
router.get('/:id', getProducto);        // GET    /api/productos/:id
router.post('/', postProducto);         // POST   /api/productos
router.put('/:id', putProducto);        // PUT    /api/productos/:id
router.delete('/:id', deleteProductoController); // DELETE /api/productos/:id

export default router;
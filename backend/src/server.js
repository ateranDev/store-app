import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db.js';
import productoRoutes from './routes/productoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';
import deudaRoutes from './routes/deudaRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente 🚀' });
});

app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/deudas', deudaRoutes);
app.use('/api/reportes', reporteRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
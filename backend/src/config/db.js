import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Verificamos la conexión apenas arranca el servidor
pool.connect()
  .then((client) => {
    console.log('✅ Conectado a PostgreSQL correctamente');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
  });

export default pool;
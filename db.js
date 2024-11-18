const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Verificar la conexión
(async () => {
    try {
        const client = await pool.connect();
        console.log('Conexión exitosa a la base de datos');
        client.release();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error.message);
    }
})();

module.exports = pool;
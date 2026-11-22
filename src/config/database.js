/**
 * Configuración de Base de Datos MySQL
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo como 'database.js' (sin .example)
 * 2. Cambia los valores según tu configuración local o de hosting
 */

const mysql = require('mysql2/promise');

// Configuración para desarrollo local
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',  // Tu contraseña de MySQL
    database: process.env.DB_NAME || 'prestafacil',

    // Pool de conexiones
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // Configuración adicional
    charset: 'utf8mb4'
};

// TiDB Cloud / Aiven exigen TLS: activar con DB_SSL=true
if (process.env.DB_SSL === 'true') {
    dbConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
}

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para verificar conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
}

// Función para ejecutar queries
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en query:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    query,
    testConnection,
    dbConfig
};

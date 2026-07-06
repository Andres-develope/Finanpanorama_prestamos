/**
 * PrestaFácil - Sistema de Gestión de Préstamos
 * Servidor principal con arquitectura MVC + MySQL + Auth
 */

const express = require('express');
const path = require('path');
require('dotenv').config(); // Cargar variables de entorno

// Importar configuración de base de datos
const { testConnection } = require('./src/config/database');

// Importar rutas
const clienteRoutes = require('./src/routes/clienteRoutes');
const authRoutes = require('./src/routes/authRoutes');
const viewRoutes = require('./src/routes/viewRoutes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Logger
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ============================================
// RUTAS
// ============================================

// API de autenticación
app.use('/api/auth', authRoutes);

// API de clientes
app.use('/api/clientes', clienteRoutes);

// Vistas HTML
app.use('/', viewRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

async function startServer() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        🚀 PrestaFácil - Iniciando Servidor             ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    console.log('📦 Verificando conexión a MySQL...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.log('');
        console.log('⚠️  MySQL no conectado - usando almacenamiento en memoria');
        console.log('');
    }

    app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║        ✅ Servidor Iniciado Correctamente              ║');
        console.log('╠════════════════════════════════════════════════════════╣');
        console.log(`║  📍 URL: http://localhost:${PORT}                           ║`);
        console.log('║                                                        ║');
        console.log('║  📋 Páginas Públicas:                                  ║');
        console.log(`║     • Inicio:       http://localhost:${PORT}/               ║`);
        console.log(`║     • Solicitud:    http://localhost:${PORT}/solicitud      ║`);
        console.log('║                                                        ║');
        console.log('║  🔐 Panel Admin:                                       ║');
        console.log(`║     • Login:        http://localhost:${PORT}/admin/login    ║`);
        console.log(`║     • Clientes:     http://localhost:${PORT}/admin/clientes ║`);
        console.log('║                                                        ║');
        console.log('║  👤 Credenciales Admin:                                ║');
        console.log('║     • Usuario: admin                                   ║');
        console.log('║     • Password: admin123                               ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log('');
    });
}

startServer();

module.exports = app;

/**
 * View Routes
 * Rutas para servir las vistas HTML
 */

const express = require('express');
const router = express.Router();
const path = require('path');

const viewsDir = path.join(__dirname, '../../public');

// ============================================
// RUTAS PÚBLICAS (clientes)
// ============================================

// GET / - Página de inicio
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsDir, 'index.html'));
});

// GET /solicitud - Formulario de solicitud
router.get('/solicitud', (req, res) => {
    res.sendFile(path.join(viewsDir, 'solicitud.html'));
});

// GET /pagare/:id - Página del pagaré
router.get('/pagare/:id', (req, res) => {
    res.sendFile(path.join(viewsDir, 'pagare.html'));
});

// GET /contacto - Página de contacto
router.get('/contacto', (req, res) => {
    res.sendFile(path.join(viewsDir, 'contacto.html'));
});

// GET /exito - Página de registro exitoso
router.get('/exito', (req, res) => {
    res.sendFile(path.join(viewsDir, 'exito.html'));
});

// ============================================
// RUTAS DE ADMINISTRADOR
// ============================================

// GET /admin/login - Login de administrador
router.get('/admin/login', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/login.html'));
});

// GET /admin/clientes - Panel de clientes (protegido en frontend)
router.get('/admin/clientes', (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin/clientes.html'));
});

// Redirigir /clientes al panel de admin
router.get('/clientes', (req, res) => {
    res.redirect('/admin/clientes');
});

module.exports = router;

/**
 * Auth Routes
 * Rutas de autenticación para administrador
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authController.logout);

// GET /api/auth/verify - Verificar sesión activa
router.get('/verify', authController.verify);

module.exports = router;

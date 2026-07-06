/**
 * Cliente Routes
 * Rutas API para operaciones de clientes
 */

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// GET /api/clientes/stats - Obtener estadísticas (antes de :id para evitar conflicto)
router.get('/stats', clienteController.getStats);

// GET /api/clientes - Obtener todos los clientes
router.get('/', clienteController.getAll);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', clienteController.getById);

// POST /api/clientes - Crear nuevo cliente
router.post('/', clienteController.create);

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', clienteController.update);

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', clienteController.delete);

// POST /api/clientes/:id/firmar - Firmar documento
router.post('/:id/firmar', clienteController.firmar);

module.exports = router;

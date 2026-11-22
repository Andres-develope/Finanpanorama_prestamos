/**
 * Cliente Controller
 * Controlador para manejar las operaciones de clientes
 */

const Cliente = require('../models/Cliente');
const { enviarCorreoConfirmacion } = require('../services/nodemailerService');
const { subirFirmaNube } = require('../services/cloudinaryService');

const clienteController = {
    /**
     * Obtener todos los clientes
     * GET /api/clientes
     */
    getAll: async (req, res) => {
        try {
            const clientes = await Cliente.findAll();
            res.json(clientes);
        } catch (error) {
            console.error('Error getAll:', error);
            res.status(500).json({ error: 'Error al obtener clientes' });
        }
    },

    /**
     * Obtener un cliente por ID
     * GET /api/clientes/:id
     */
    getById: async (req, res) => {
        try {
            const cliente = await Cliente.findById(req.params.id);

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            res.json(cliente);
        } catch (error) {
            console.error('Error getById:', error);
            res.status(500).json({ error: 'Error al obtener cliente' });
        }
    },

    /**
     * Crear nuevo cliente
     * POST /api/clientes
     */
    create: async (req, res) => {
        try {
            // Validación básica
            const { nombre, apellido, email, numeroDocumento, celular, direccion, ciudad, cantidad } = req.body;

            if (!nombre || !apellido || !email || !numeroDocumento || !celular || !direccion || !ciudad || !cantidad) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }

            // Verificar si ya existe un cliente con ese documento
            const existentePorDocumento = await Cliente.findByDocumento(numeroDocumento);
            if (existentePorDocumento) {
                return res.status(409).json({ error: 'Ya existe un cliente con ese número de documento' });
            }

            // Verificar si ya existe un cliente con ese correo
            const existentePorEmail = await Cliente.findByEmail(email);
            if (existentePorEmail) {
                return res.status(409).json({ error: 'Ya existe un cliente con ese correo electrónico' });
            }

            const cliente = await Cliente.create(req.body);
            
            // No se espera el correo: si el SMTP está bloqueado (Render Free) no debe colgar la respuesta
            enviarCorreoConfirmacion(cliente.email, cliente.nombre).catch(() => {});

            res.status(201).json(cliente);
        } catch (error) {
            console.error('Error create:', error);
            res.status(500).json({ error: 'Error al crear cliente' });
        }
    },

    /**
     * Actualizar cliente
     * PUT /api/clientes/:id
     */
    update: async (req, res) => {
        try {
            const cliente = await Cliente.update(req.params.id, req.body);

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            res.json(cliente);
        } catch (error) {
            console.error('Error update:', error);
            res.status(500).json({ error: 'Error al actualizar cliente' });
        }
    },

    /**
     * Eliminar cliente
     * DELETE /api/clientes/:id
     */
    delete: async (req, res) => {
        try {
            const deleted = await Cliente.delete(req.params.id);

            if (!deleted) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            res.json({ message: 'Cliente eliminado correctamente' });
        } catch (error) {
            console.error('Error delete:', error);
            res.status(500).json({ error: 'Error al eliminar cliente' });
        }
    },

    /**
     * Firmar documento
     * POST /api/clientes/:id/firmar
     */
    firmar: async (req, res) => {
        try {
            const { firma } = req.body;

            if (!firma) {
                return res.status(400).json({ error: 'Se requiere la firma digital' });
            }

            // Obtener IP del cliente
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            // 1. Subir la firma de Base64 a Cloudinary para no saturar la base de datos
            const firmaUrl = await subirFirmaNube(firma, req.params.id);
            
            // Si Cloudinary falla por alguna razón, guardamos el Base64 como plan B para no perder la firma
            const firmaFinal = firmaUrl ? firmaUrl : firma;

            // 2. Guardamos en la base de datos (se guardará la URL corta si funcionó la subida)
            const cliente = await Cliente.firmarDocumento(req.params.id, firmaFinal, ipAddress);

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            res.json(cliente);
        } catch (error) {
            console.error('Error firmar:', error);
            res.status(500).json({ error: 'Error al firmar documento' });
        }
    },

    /**
     * Obtener estadísticas
     * GET /api/clientes/stats
     */
    getStats: async (req, res) => {
        try {
            const stats = await Cliente.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Error getStats:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    /**
     * Obtener historial de auditoría
     * GET /api/clientes/:id/audit
     */
    getAuditTrail: async (req, res) => {
        try {
            const auditTrail = await Cliente.getAuditTrail(req.params.id);
            res.json(auditTrail);
        } catch (error) {
            console.error('Error getAuditTrail:', error);
            res.status(500).json({ error: 'Error al obtener historial de auditoría' });
        }
    }
};

module.exports = clienteController;

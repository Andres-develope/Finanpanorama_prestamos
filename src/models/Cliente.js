/**
 * Cliente Model - MySQL (mysql2/promise)
 * Data Access Layer con patrón Active Record
 * Mapea los objetos JavaScript a la tabla `clientes` en MySQL.
 */

const { query } = require('../config/database');

// ─────────────────────────────────────────────────────────
// Helpers: mapeo snake_case (DB) ↔ camelCase (JS)
// ─────────────────────────────────────────────────────────

/**
 * Transforma una fila de MySQL (snake_case) en un objeto JS (camelCase).
 * @param {Object} row - Fila devuelta por mysql2
 * @returns {Object} Objeto cliente normalizado
 */
function rowToCliente(row) {
    if (!row) return null;
    return {
        id:                 row.id,
        nombre:             row.nombre,
        apellido:           row.apellido,
        email:              row.email,
        tipoDocumento:      row.tipo_documento,
        numeroDocumento:    row.numero_documento,
        celular:            row.celular,
        direccion:          row.direccion,
        ciudad:             row.ciudad,
        empresa:            row.empresa,
        refNombre:          row.ref_nombre,
        refCelular:         row.ref_celular,
        refParentesco:      row.ref_parentesco,
        cantidad:           parseFloat(row.cantidad) || 0,
        estado:             row.estado,
        firmaDigital:       row.firma_digital,
        documentoFirmado:   Boolean(row.documento_firmado),
        fechaFirma:         row.fecha_firma,
        identificadorUnico: row.identificador_unico,
        ipFirma:            row.ip_firma,
        fechaRegistro:      row.fecha_registro,
        fechaActualizacion: row.fecha_actualizacion,
    };
}

// ─────────────────────────────────────────────────────────
// Clase Cliente — Active Record Pattern
// ─────────────────────────────────────────────────────────

class Cliente {

    /**
     * Obtener todos los clientes ordenados por fecha de registro descendente.
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const rows = await query(
            'SELECT * FROM clientes ORDER BY fecha_registro DESC'
        );
        return rows.map(rowToCliente);
    }

    /**
     * Buscar un cliente por su ID.
     * @param {number|string} id
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const rows = await query(
            'SELECT * FROM clientes WHERE id = ?',
            [id]
        );
        return rowToCliente(rows[0] || null);
    }

    /**
     * Buscar un cliente por número de documento.
     * @param {string} numeroDocumento
     * @returns {Promise<Object|null>}
     */
    static async findByDocumento(numeroDocumento) {
        const rows = await query(
            'SELECT * FROM clientes WHERE numero_documento = ?',
            [numeroDocumento]
        );
        return rowToCliente(rows[0] || null);
    }

    /**
     * Buscar un cliente por correo electrónico.
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        const rows = await query(
            'SELECT * FROM clientes WHERE email = ?',
            [email]
        );
        return rowToCliente(rows[0] || null);
    }

    /**
     * Crear un nuevo cliente en la base de datos.
     * @param {Object} data - Datos del formulario de solicitud
     * @returns {Promise<Object>} Cliente creado con su ID asignado
     */
    static async create(data) {
        const identificadorUnico = Cliente.generateUUID();

        const sql = `
            INSERT INTO clientes (
                nombre, apellido, email, tipo_documento, numero_documento,
                celular, direccion, ciudad, empresa,
                ref_nombre, ref_celular, ref_parentesco,
                cantidad, estado, identificador_unico
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)
        `;

        const params = [
            data.nombre,
            data.apellido,
            data.email,
            data.tipoDocumento || 'CC',
            data.numeroDocumento,
            data.celular,
            data.direccion,
            data.ciudad,
            data.empresa       || null,
            data.refNombre     || null,
            data.refCelular    || null,
            data.refParentesco || null,
            parseFloat(data.cantidad) || 0,
            identificadorUnico,
        ];

        const result = await query(sql, params);
        const insertId = result.insertId;

        console.log(`✅ Cliente creado en MySQL: ${data.nombre} ${data.apellido} (ID: ${insertId})`);

        // Registrar evento en audit_trail
        await Cliente._registrarAudit(insertId, 'CREACION', `Cliente ${data.nombre} ${data.apellido} registrado en el sistema`);

        return await Cliente.findById(insertId);
    }

    /**
     * Actualizar los datos de un cliente.
     * @param {number|string} id
     * @param {Object} data - Campos a actualizar
     * @returns {Promise<Object|null>}
     */
    static async update(id, data) {
        const cliente = await Cliente.findById(id);
        if (!cliente) return null;

        const sql = `
            UPDATE clientes SET
                nombre           = ?,
                apellido         = ?,
                email            = ?,
                tipo_documento   = ?,
                numero_documento = ?,
                celular          = ?,
                direccion        = ?,
                ciudad           = ?,
                empresa          = ?,
                ref_nombre       = ?,
                ref_celular      = ?,
                ref_parentesco   = ?,
                cantidad         = ?,
                estado           = ?
            WHERE id = ?
        `;

        const params = [
            data.nombre          ?? cliente.nombre,
            data.apellido        ?? cliente.apellido,
            data.email           ?? cliente.email,
            data.tipoDocumento   ?? cliente.tipoDocumento,
            data.numeroDocumento ?? cliente.numeroDocumento,
            data.celular         ?? cliente.celular,
            data.direccion       ?? cliente.direccion,
            data.ciudad          ?? cliente.ciudad,
            data.empresa         ?? cliente.empresa,
            data.refNombre       ?? cliente.refNombre,
            data.refCelular      ?? cliente.refCelular,
            data.refParentesco   ?? cliente.refParentesco,
            parseFloat(data.cantidad ?? cliente.cantidad) || 0,
            data.estado          ?? cliente.estado,
            id,
        ];

        await query(sql, params);
        await Cliente._registrarAudit(id, 'ACTUALIZACION', `Datos del cliente actualizados`);

        return await Cliente.findById(id);
    }

    /**
     * Eliminar un cliente de la base de datos.
     * @param {number|string} id
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const result = await query(
            'DELETE FROM clientes WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Registrar la firma digital del pagaré.
     * @param {number|string} id
     * @param {string} firmaData  - Data URL de la firma (canvas base64)
     * @param {string} ipAddress  - IP del cliente que firmó
     * @returns {Promise<Object|null>}
     */
    static async firmarDocumento(id, firmaData, ipAddress = null) {
        const cliente = await Cliente.findById(id);
        if (!cliente) return null;

        const sql = `
            UPDATE clientes SET
                firma_digital     = ?,
                documento_firmado = TRUE,
                fecha_firma       = NOW(),
                estado            = 'aprobado',
                ip_firma          = ?
            WHERE id = ?
        `;

        await query(sql, [firmaData, ipAddress, id]);
        await Cliente._registrarAudit(id, 'FIRMA', `Documento firmado digitalmente desde IP: ${ipAddress}`);

        console.log(`✅ Documento firmado en MySQL: ${cliente.nombre} ${cliente.apellido}`);
        return await Cliente.findById(id);
    }

    /**
     * Obtener estadísticas generales del sistema.
     * @returns {Promise<Object>}
     */
    static async getStats() {
        const rows = await query(`
            SELECT
                COUNT(*)                                          AS total,
                SUM(estado = 'aprobado')                         AS aprobados,
                SUM(estado = 'pendiente')                        AS pendientes,
                SUM(estado = 'rechazado')                        AS rechazados,
                COALESCE(SUM(cantidad), 0)                       AS monto_total,
                COALESCE(SUM(CASE WHEN estado = 'aprobado' THEN cantidad ELSE 0 END), 0) AS monto_aprobado
            FROM clientes
        `);

        const r = rows[0];
        return {
            total:          parseInt(r.total)      || 0,
            aprobados:      parseInt(r.aprobados)  || 0,
            pendientes:     parseInt(r.pendientes) || 0,
            rechazados:     parseInt(r.rechazados) || 0,
            monto_total:    parseFloat(r.monto_total)    || 0,
            monto_aprobado: parseFloat(r.monto_aprobado) || 0,
        };
    }

    /**
     * Obtener el historial de auditoría de un cliente.
     * @param {number|string} clienteId
     * @returns {Promise<Array>}
     */
    static async getAuditTrail(clienteId) {
        const rows = await query(
            'SELECT * FROM audit_trail WHERE cliente_id = ? ORDER BY timestamp DESC',
            [clienteId]
        );
        return rows;
    }

    // ─────────────────────────────────────────────────────
    // Métodos privados / utilitarios
    // ─────────────────────────────────────────────────────

    /**
     * Registrar un evento en la tabla audit_trail.
     * @private
     */
    static async _registrarAudit(clienteId, tipoEvento, descripcion, ipAddress = null) {
        try {
            await query(
                'INSERT INTO audit_trail (cliente_id, tipo_evento, descripcion, ip_address) VALUES (?, ?, ?, ?)',
                [clienteId, tipoEvento, descripcion, ipAddress]
            );
        } catch (err) {
            // No interrumpir el flujo principal si falla el audit
            console.warn('⚠️  Audit trail no registrado:', err.message);
        }
    }

    /**
     * Generar un UUID v4 único para identificar el documento.
     * @returns {string} UUID en mayúsculas
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        }).toUpperCase();
    }
}

module.exports = Cliente;

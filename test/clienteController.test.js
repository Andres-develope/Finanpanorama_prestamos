/**
 * Pruebas unitarias - clienteController
 * Herramienta: Jest
 *
 * Se aíslan las dependencias externas (modelo Cliente, servicio de correo)
 * con jest.mock para probar solo la lógica del controlador (patrón AAA:
 * Arrange - Act - Assert), sin necesidad de conexión real a MySQL.
 */

jest.mock('../src/models/Cliente');
jest.mock('../src/services/nodemailerService', () => ({
    enviarCorreoConfirmacion: jest.fn().mockResolvedValue(true)
}));

const Cliente = require('../src/models/Cliente');
const clienteController = require('../src/controllers/clienteController');

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('clienteController.create', () => {

    test('Caso 5: faltan campos requeridos -> 400', async () => {
        const req = { body: { nombre: 'Andrés' } }; // faltan casi todos los campos
        const res = mockResponse();

        await clienteController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) })
        );
    });

    test('Caso 6: documento ya existe -> 409 (no duplica cliente)', async () => {
        const req = {
            body: {
                nombre: 'Andrés', apellido: 'Fell', email: 'a@test.com',
                numeroDocumento: '123', celular: '3000000000',
                direccion: 'Calle 1', ciudad: 'Bogotá', cantidad: 500000
            }
        };
        const res = mockResponse();

        Cliente.findByDocumento.mockResolvedValue({ id: 1, numeroDocumento: '123' });

        await clienteController.create(req, res);

        expect(Cliente.findByDocumento).toHaveBeenCalledWith('123');
        expect(res.status).toHaveBeenCalledWith(409);
    });

    test('Caso 9: correo ya existe -> 409 (no duplica cliente)', async () => {
        const req = {
            body: {
                nombre: 'Andrés', apellido: 'Fell', email: 'a@test.com',
                numeroDocumento: '456', celular: '3000000000',
                direccion: 'Calle 1', ciudad: 'Bogotá', cantidad: 500000
            }
        };
        const res = mockResponse();

        Cliente.findByDocumento.mockResolvedValue(null);
        Cliente.findByEmail.mockResolvedValue({ id: 1, email: 'a@test.com' });

        await clienteController.create(req, res);

        expect(Cliente.findByEmail).toHaveBeenCalledWith('a@test.com');
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('correo') })
        );
    });
});

describe('clienteController.getById', () => {

    test('Caso 7: cliente no encontrado -> 404', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        Cliente.findById.mockResolvedValue(null);

        await clienteController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) })
        );
    });

    test('Caso 8: cliente encontrado -> 200 con los datos del cliente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        const clienteFalso = { id: 1, nombre: 'Andrés', apellido: 'Fell' };

        Cliente.findById.mockResolvedValue(clienteFalso);

        await clienteController.getById(req, res);

        expect(res.json).toHaveBeenCalledWith(clienteFalso);
    });
});

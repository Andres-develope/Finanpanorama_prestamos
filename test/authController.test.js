/**
 * Pruebas unitarias - authController
 * Herramienta: Jest
 *
 * Se prueba la lógica de autenticación del panel admin sin necesidad
 * de levantar el servidor ni la base de datos (mock de req/res de Express).
 */

const authController = require('../src/controllers/authController');

// Helper para simular el objeto "response" de Express
function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('authController.login', () => {

    test('Caso 1: credenciales correctas -> 200 y token generado', () => {
        const req = { body: { username: 'admin', password: 'admin123' } };
        const res = mockResponse();

        authController.login(req, res);

        expect(res.status).not.toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                token: expect.any(String)
            })
        );
    });

    test('Caso 2: credenciales incorrectas -> 401', () => {
        const req = { body: { username: 'admin', password: 'clave-mala' } };
        const res = mockResponse();

        authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) })
        );
    });

    test('Caso 3: faltan campos requeridos -> 400', () => {
        const req = { body: { username: 'admin' } }; // sin password
        const res = mockResponse();

        authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) })
        );
    });
});

describe('authController.requireAuth (middleware)', () => {

    test('Caso 4: sin token -> 401 y no continua (next no se llama)', () => {
        const req = { headers: {} };
        const res = mockResponse();
        const next = jest.fn();

        authController.requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});

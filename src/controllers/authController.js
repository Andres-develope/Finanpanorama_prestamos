/**
 * Auth Controller
 * Controlador para autenticación de administrador
 */

// Credenciales de administrador (en producción usar base de datos y bcrypt)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'  // Cambiar en producción
};

// Sesiones activas (en producción usar Redis o base de datos)
const activeSessions = new Map();

const authController = {
    /**
     * Login de administrador
     * POST /api/auth/login
     */
    login: (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
            }

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                // Generar token simple
                const token = generateToken();
                activeSessions.set(token, {
                    username,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
                });

                res.json({
                    success: true,
                    token,
                    message: 'Login exitoso'
                });
            } else {
                res.status(401).json({ error: 'Credenciales incorrectas' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error en el login' });
        }
    },

    /**
     * Logout de administrador
     * POST /api/auth/logout
     */
    logout: (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (token) {
                activeSessions.delete(token);
            }
            res.json({ success: true, message: 'Logout exitoso' });
        } catch (error) {
            res.status(500).json({ error: 'Error en el logout' });
        }
    },

    /**
     * Verificar sesión
     * GET /api/auth/verify
     */
    verify: (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ authenticated: false });
            }

            const session = activeSessions.get(token);

            if (!session || new Date() > session.expiresAt) {
                activeSessions.delete(token);
                return res.status(401).json({ authenticated: false });
            }

            res.json({ authenticated: true, username: session.username });
        } catch (error) {
            res.status(500).json({ error: 'Error verificando sesión' });
        }
    },

    /**
     * Middleware para proteger rutas
     */
    requireAuth: (req, res, next) => {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }

        const session = activeSessions.get(token);

        if (!session || new Date() > session.expiresAt) {
            activeSessions.delete(token);
            return res.status(401).json({ error: 'Sesión expirada' });
        }

        req.admin = session;
        next();
    }
};

// Generar token aleatorio
function generateToken() {
    return 'admin_' + Array.from({ length: 32 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            .charAt(Math.floor(Math.random() * 62))
    ).join('');
}

module.exports = authController;

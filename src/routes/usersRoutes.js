const express = require("express");
const userService = require("../services/userService");
const verifyToken = require("../middlewares/authMiddleware"); // ← viene de middlewares/

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación de usuarios
 */

const router = express.Router();
const service = new userService();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Luis Anaya
 *               email:
 *                 type: string
 *                 example: luis@example.com
 *               password:
 *                 type: string
 *                 example: miPassword123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o el usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await service.register(name, email, password);
        res.status(201).json({ message: "Usuario creado exitosamente", user });
    } catch (error) {
        if (error.message === "Todos los campos son obligatorios" || error.message === "El usuario ya existe") {
            return res.status(400).json({ msg: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: luis@example.com
 *               password:
 *                 type: string
 *                 example: miPassword123
 *     responses:
 *       200:
 *         description: Login exitoso, retorna el token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 664a1b2c3d4e5f6a7b8c9d0e
 *                     name:
 *                       type: string
 *                       example: Luis Anaya
 *                     email:
 *                       type: string
 *                       example: luis@example.com
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await service.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === "Usuario no encontrado" || error.message === "Contraseña incorrecta") {
            return res.status(401).json({ msg: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (ruta protegida)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtiene los datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario extraídos del token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Acceso autorizado
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 664a1b2c3d4e5f6a7b8c9d0e
 *                     name:
 *                       type: string
 *                       example: Luis Anaya
 *                     email:
 *                       type: string
 *                       example: luis@example.com
 *       401:
 *         description: Token requerido, inválido o expirado
 */
router.get("/me", verifyToken, (req, res) => {
    res.json({ msg: "Acceso autorizado", user: req.user });
});

module.exports = router;

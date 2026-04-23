const express = require("express");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación de usuarios
 */

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
 *       400:
 *         description: Datos inválidos o el usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
const userService = require("../services/userService");

const router = express.Router();
const service = new userService();

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

module.exports = router;
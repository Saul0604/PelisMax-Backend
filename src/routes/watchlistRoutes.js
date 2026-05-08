const express = require('express');
const router = express.Router();
const WatchlistService = require('../services/watchlistService');
const verifyToken = require('../middlewares/authMiddleware');

const service = new WatchlistService();

/**
 * @swagger
 * tags:
 *   name: Watchlist
 *   description: Endpoints para gestionar la lista de seguimiento (watchlist) de películas
 */

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/watchlist
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/watchlist:
 *   get:
 *     summary: Obtiene la lista de películas guardadas del usuario
 *     tags: [Watchlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo de películas con ID y Poster
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "550"
 *                   poster:
 *                     type: string
 *                     example: "/path/to/poster.jpg"
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token inválido o expirado"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const watchlist = await service.getWatchlist(userId);
        res.status(200).json(watchlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/watchlist/mark-watched/:movieId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/watchlist/mark-watched/{movieId}:
 *   post:
 *     summary: Elimina una película de la watchlist (marcar como vista)
 *     tags: [Watchlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la película a eliminar
 *     responses:
 *       200:
 *         description: Película eliminada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Película eliminada de la watchlist con éxito
 *       404:
 *         description: La película no estaba en la watchlist
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token inválido o expirado"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/mark-watched/:movieId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId } = req.params;
        const result = await service.markAsWatched(userId, movieId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === "La película no estaba en la watchlist") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/watchlist/add
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/watchlist/add:
 *   post:
 *     summary: Agrega una película a la watchlist
 *     tags: [Watchlist]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - posterPath
 *             properties:
 *               movieId:
 *                 type: string
 *                 example: "550"
 *               posterPath:
 *                 type: string
 *                 example: "/path/to/poster.jpg"
 *     responses:
 *       201:
 *         description: Película agregada exitosamente
 *       400:
 *         description: Datos faltantes o la película ya existe en la lista
 *       401:
 *         description: Token requerido, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token inválido o expirado"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/add', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movieId, posterPath } = req.body;
        const newEntry = await service.addToWatchlist(userId, movieId, posterPath);
        res.status(201).json({ message: "Agregada a la watchlist", data: newEntry });
    } catch (error) {
        if (error.message === "movieId y posterPath son obligatorios") {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "La película ya está en tu watchlist" });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require("express");
const RatingService = require("../services/ratingService");
const verifyToken = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Sistema de valoración de películas
 */

const router = express.Router();
const service = new RatingService();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/rate:
 *   post:
 *     summary: Califica una película (crea o actualiza)
 *     tags: [Ratings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imdbId
 *               - score
 *             properties:
 *               imdbId:
 *                 type: string
 *                 example: tt0372784
 *               score:
 *                 type: number
 *                 example: 4
 *     responses:
 *       200:
 *         description: Calificación guardada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Calificación guardada exitosamente
 *                 rating:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: 664a1b2c3d4e5f6a7b8c9d0e
 *                     imdbId:
 *                       type: string
 *                       example: tt0372784
 *                     score:
 *                       type: number
 *                       example: 4
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido, inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", verifyToken, async (req, res) => {
    try {
        const { imdbId, score } = req.body;
        const userId = req.user.id;

        if (!imdbId) return res.status(400).json({ msg: "El imdbId es requerido" });

        const rating = await service.rateMovie(userId, imdbId, score);
        res.status(200).json({ message: "Calificación guardada exitosamente", rating });
    } catch (error) {
        if (error.message === "El score debe ser entre 1 y 5") {
            return res.status(400).json({ msg: error.message });
        }
        res.status(500).json({ msg: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rate/:imdbId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/rate/{imdbId}:
 *   get:
 *     summary: Obtiene el promedio, total de votos y calificación del usuario para una película
 *     tags: [Ratings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imdbId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de IMDb de la película
 *         example: tt0372784
 *     responses:
 *       200:
 *         description: Estadísticas de la película
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imdbId:
 *                   type: string
 *                   example: tt0372784
 *                 averageScore:
 *                   type: number
 *                   example: 4.2
 *                 totalVotes:
 *                   type: number
 *                   example: 10
 *                 userScore:
 *                   type: number
 *                   example: 4
 *       401:
 *         description: Token requerido, inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:imdbId", verifyToken, async (req, res) => {
    try {
        const { imdbId } = req.params;
        const userId = req.user.id;

        const stats = await service.getMovieStats(imdbId);
        const userScore = await service.getUserRating(userId, imdbId);

        res.status(200).json({ imdbId, ...stats, userScore });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

module.exports = router;
const express = require("express");
const OmdbService = require("../services/omdbService");
const verifyToken = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Endpoints para búsqueda y consulta de películas (OMDb)
 */

const router = express.Router();
const service = new OmdbService();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/movies/
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/movies/:
 *   get:
 *     summary: Obtiene películas destacadas por categoría
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías con sus películas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     example: Acción
 *                   movies:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         Title:
 *                           type: string
 *                           example: Batman Begins
 *                         Year:
 *                           type: string
 *                           example: "2005"
 *                         imdbID:
 *                           type: string
 *                           example: tt0372784
 *                         Poster:
 *                           type: string
 *                           example: https://m.media-amazon.com/images/...
 *       401:
 *         description: Token requerido, inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const data = await service.getFeatured();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/movies/search?q=batman&page=1
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Busca películas por título
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Texto a buscar
 *         example: batman
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (cada página trae 10 resultados)
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Search:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Title:
 *                         type: string
 *                         example: Batman Begins
 *                       Year:
 *                         type: string
 *                         example: "2005"
 *                       imdbID:
 *                         type: string
 *                         example: tt0372784
 *                       Poster:
 *                         type: string
 *                         example: https://m.media-amazon.com/images/...
 *                 totalResults:
 *                   type: string
 *                   example: "48"
 *       400:
 *         description: El parámetro q es requerido
 *       401:
 *         description: Token requerido, inválido o expirado
 *       404:
 *         description: No se encontraron resultados
 */
router.get("/search", verifyToken, async (req, res) => {
    try {
        const { q, page } = req.query;
        if (!q) return res.status(400).json({ msg: "El parámetro q es requerido" });

        const data = await service.searchMovies(q, page);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ msg: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/movies/:imdbId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/movies/{imdbId}:
 *   get:
 *     summary: Obtiene el detalle completo de una película por su ID de IMDb
 *     tags: [Movies]
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
 *         description: Detalle completo de la película
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Title:
 *                   type: string
 *                   example: Batman Begins
 *                 Year:
 *                   type: string
 *                   example: "2005"
 *                 Genre:
 *                   type: string
 *                   example: Action, Adventure
 *                 Director:
 *                   type: string
 *                   example: Christopher Nolan
 *                 Actors:
 *                   type: string
 *                   example: Christian Bale, Michael Caine
 *                 Plot:
 *                   type: string
 *                   example: After witnessing his parents' murder...
 *                 Poster:
 *                   type: string
 *                   example: https://m.media-amazon.com/images/...
 *                 imdbRating:
 *                   type: string
 *                   example: "8.2"
 *                 Runtime:
 *                   type: string
 *                   example: 140 min
 *       401:
 *         description: Token requerido, inválido o expirado
 *       404:
 *         description: Película no encontrada
 */
router.get("/:imdbId", verifyToken, async (req, res) => {
    try {
        const { imdbId } = req.params;
        const data = await service.getMovieById(imdbId);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ msg: error.message });
    }
});

module.exports = router;
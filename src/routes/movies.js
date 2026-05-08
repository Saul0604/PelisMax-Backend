const express = require("express");
const OmdbService = require("../services/omdbService");
const RatingService = require("../services/ratingService");
const verifyToken = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Endpoints para búsqueda y consulta de películas (OMDb)
 */

const router = express.Router();
const omdbService = new OmdbService();
const ratingService = new RatingService();


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
        const data = await omdbService.getFeatured();
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
 *     summary: Busca películas por título con coincidencias parciales
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Texto a buscar (búsqueda insensible a mayúsculas/minúsculas)
 *         example: spider
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (cada página trae 10 resultados)
 *     responses:
 *       200:
 *         description: Array de películas encontradas. Retorna arreglo vacío si no hay coincidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Title:
 *                         type: string
 *                         example: Spider-Man
 *                       Poster:
 *                         type: string
 *                         example: https://m.media-amazon.com/images/...
 *                       imdbID:
 *                         type: string
 *                         example: tt0145487
 *                 totalResults:
 *                   type: integer
 *                   example: 45
 *                 message:
 *                   type: string
 *                   example: No se encontraron resultados para "xyz"
 *       400:
 *         description: El parámetro q es requerido
 *       401:
 *         description: Token requerido, inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/search", verifyToken, async (req, res) => {
    try {
        const { q, page } = req.query;
        
        // Validar que el parámetro q sea proporcionado y no esté vacío
        if (!q || q.trim() === "") {
            return res.status(400).json({ 
                msg: "El parámetro q es requerido" 
            });
        }

        // Buscar películas usando OmdbService
        const data = await omdbService.searchMovies(q.trim(), page);
        
        // Si no hay resultados, retornar arreglo vacío con mensaje informativo
        if (!data.Search || data.Search.length === 0) {
            return res.status(200).json({
                movies: [],
                totalResults: 0,
                message: `No se encontraron resultados para "${q.trim()}"`
            });
        }

        // Filtrar y retornar solo los campos esenciales: Title, Poster, imdbID
        const optimizedMovies = data.Search.map(movie => ({
            Title: movie.Title,
            Poster: movie.Poster,
            imdbID: movie.imdbID
        }));

        res.status(200).json({
            movies: optimizedMovies,
            totalResults: parseInt(data.totalResults) || 0
        });
    } catch (error) {
        // Retornar código 200 con arreglo vacío en caso de error de búsqueda
        res.status(200).json({
            movies: [],
            totalResults: 0,
            message: `No se encontraron resultados para "${req.query.q}"`
        });
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
        const userId = req.user?.id ?? null;

        // Trae info de OMDb + stats de tu BD en paralelo
        const [movie, stats, userScore] = await Promise.all([
            omdbService.getMovieById(imdbId),
            ratingService.getMovieStats(imdbId),
            userId ? ratingService.getUserRating(userId, imdbId) : Promise.resolve(null),
        ]);

        res.status(200).json({
            ...movie,
            communityRating: {
                averageScore: stats.averageScore,
                totalVotes: stats.totalVotes,
                userScore,
            },
        });
    } catch (error) {
        res.status(404).json({ msg: error.message });
    }
});

module.exports = router;

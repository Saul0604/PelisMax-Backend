const express = require('express');
const router = express.Router();
const ReviewService = require('../services/reviewService');
const verifyToken = require('../middlewares/authMiddleware');

const service = new ReviewService();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Gestión de reseñas de películas
 */

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews/me
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reviews/me:
 *   get:
 *     summary: Obtiene las reseñas del usuario autenticado
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reseñas con información de la película
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   formattedDate:
 *                     type: string
 *                     example: "25 Dic 2025"
 *                   movieId:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       poster:
 *                         type: string
 *                       releaseYear:
 *                         type: string
 *       401:
 *         description: No autorizado
 */
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await service.getUserReviews(userId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews/movie/:movieId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reviews/movie/{movieId}:
 *   get:
 *     summary: Obtiene todas las reseñas de una película específica
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         example: "tt0468569"
 *     responses:
 *       200:
 *         description: Lista de reseñas con el nombre del autor
 *       404:
 *         description: No se encontraron reseñas para esta película
 */
router.get('/movie/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;
        const reviews = await service.getMovieReviews(movieId);
        
        if (reviews.length === 0) {
            return res.status(404).json({ msg: "Aún no hay reseñas para esta película" });
        }
        
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reviews
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crea una nueva reseña
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieId, movieTitle, moviePoster, movieYear, content, rating]
 *             properties:
 *               movieId:
 *                 type: string
 *                 example: "tt0468569"
 *               movieTitle:
 *                 type: string
 *                 example: "The Dark Knight"
 *               moviePoster:
 *                 type: string
 *               movieYear:
 *                 type: string
 *               content:
 *                 type: string
 *                 maxLength: 500
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Reseña creada con éxito
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const review = await service.createReview(userId, req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/reviews/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reviews/{id}:
 *   patch:
 *     summary: Actualiza una reseña existente
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reseña actualizada
 *       403:
 *         description: No tienes permiso
 *       404:
 *         description: No encontrada
 */
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = req.params.id;
        const updatedReview = await service.updateReview(reviewId, userId, req.body);
        res.status(200).json(updatedReview);
    } catch (error) {
        const status = error.message.includes("permiso") ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/reviews/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Elimina una reseña
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña eliminada
 *       403:
 *         description: No tienes permiso
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = req.params.id;
        const result = await service.deleteReview(reviewId, userId);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message.includes("permiso") ? 403 : 404;
        res.status(status).json({ error: error.message });
    }
});

module.exports = router;

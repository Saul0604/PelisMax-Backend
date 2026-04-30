const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const Comment = require("../models/Comment");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints para gestionar comentarios en películas
 */

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/comments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Crear un comentario en una película
 *     tags: [Comments]
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
 *               - movieTitle
 *               - text
 *             properties:
 *               movieId:
 *                 type: string
 *                 example: "tt0468569"
 *               movieTitle:
 *                 type: string
 *                 example: "The Dark Knight"
 *               text:
 *                 type: string
 *                 maxLength: 250
 *                 example: "¡Una película excelente!"
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 comment:
 *                   type: object
 *       400:
 *         description: Error en validación (comentario vacío, muy largo, etc.)
 *       401:
 *         description: No autorizado
 */
router.post("/", verifyToken, async (req, res) => {
    try {
        const { movieId, movieTitle, text } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!movieId || !movieTitle || !text) {
            return res.status(400).json({ 
                msg: "Los campos movieId, movieTitle y text son requeridos" 
            });
        }

        // Validar que el comentario no esté vacío
        if (text.trim().length === 0) {
            return res.status(400).json({ 
                msg: "El comentario no puede estar vacío" 
            });
        }

        // Validar la longitud del comentario (máximo 250 caracteres)
        if (text.length > 250) {
            return res.status(400).json({ 
                msg: `El comentario no puede exceder 250 caracteres (actual: ${text.length})` 
            });
        }

        // Crear el comentario
        const comment = new Comment({
            userId: req.user.id,
            movieId,
            movieTitle,
            text: text.trim()
        });

        // Guardar en la base de datos
        await comment.save();

        // Responder con el comentario creado
        res.status(201).json({
            msg: "Comentario creado exitosamente",
            comment
        });
    } catch (error) {
        console.error("Error al crear comentario:", error);
        res.status(500).json({ 
            msg: "Error al crear el comentario",
            error: error.message 
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/comments/:movieId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/comments/{movieId}:
 *   get:
 *     summary: Obtener todos los comentarios de una película
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         example: "tt0468569"
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *       404:
 *         description: No se encontraron comentarios
 */
router.get("/:movieId", verifyToken, async (req, res) => {
    try {
        const { movieId } = req.params;

        const comments = await Comment.find({ movieId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        if (comments.length === 0) {
            return res.status(404).json({ 
                msg: "No hay comentarios para esta película" 
            });
        }

        res.status(200).json({
            msg: "Comentarios obtenidos exitosamente",
            total: comments.length,
            comments
        });
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ 
            msg: "Error al obtener comentarios",
            error: error.message 
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/comments/:commentId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Eliminar un comentario (solo el propietario)
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *       403:
 *         description: No tienes permiso para eliminar este comentario
 *       404:
 *         description: Comentario no encontrado
 */
router.delete("/:commentId", verifyToken, async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ 
                msg: "Comentario no encontrado" 
            });
        }

        // Verificar que el usuario sea el propietario del comentario
        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ 
                msg: "No tienes permiso para eliminar este comentario" 
            });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ 
            msg: "Comentario eliminado exitosamente" 
        });
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        res.status(500).json({ 
            msg: "Error al eliminar comentario",
            error: error.message 
        });
    }
});

module.exports = router;

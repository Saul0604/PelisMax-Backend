const express = require('express');
const router = express.Router();
const ListService = require('../services/listService');
const verifyToken = require('../middlewares/authMiddleware');

const service = new ListService();

/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: Gestión de listas personalizadas de películas
 */

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lists
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Obtiene todas las listas del usuario logueado
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo de listas
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const lists = await service.getUserLists(userId);
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lists
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Crea una nueva lista vacía
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Películas para llorar"
 *     responses:
 *       201:
 *         description: Lista creada exitosamente
 *       400:
 *         description: Nombre inválido o duplicado
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const newList = await service.createList(userId, name);
        res.status(201).json(newList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lists/:id/add
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/lists/{id}/add:
 *   post:
 *     summary: Añade una película a una lista
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la lista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieId, title, poster, releaseYear]
 *             properties:
 *               movieId:
 *                 type: string
 *               title:
 *                 type: string
 *               poster:
 *                 type: string
 *               releaseYear:
 *                 type: string
 *     responses:
 *       200:
 *         description: Película añadida con éxito
 *       400:
 *         description: La película ya existe en la lista
 *       404:
 *         description: Lista no encontrada
 */
router.post('/:id/add', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const listId = req.params.id;
        const updatedList = await service.addMovieToList(userId, listId, req.body);
        res.status(200).json(updatedList);
    } catch (error) {
        const status = error.message.includes("encontrada") ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lists/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/lists/{id}:
 *   get:
 *     summary: Obtiene el detalle de una lista específica
 *     tags: [Lists]
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
 *         description: Detalle de la lista con sus películas
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const listId = req.params.id;
        const list = await service.getListById(userId, listId);
        res.status(200).json(list);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;

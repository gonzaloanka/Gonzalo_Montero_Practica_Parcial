const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createClient,
  updateClient,
  getAllClients,
  getClientById,
  deleteClient,
  getArchivedClients,
  recoverClient
} = require('../controllers/client');
const { clientValidator, updateClientValidator } = require('../validators/clientValidator');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * /client:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *       409:
 *         description: Cliente ya existente
 */
router.post('/',
  authMiddleware,
  clientValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  createClient
);

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     summary: Actualizar un cliente existente
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 */
router.put('/:id',
  authMiddleware,
  updateClientValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  updateClient
);

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Obtener todos los clientes del usuario o su compañía
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', authMiddleware, getAllClients);

/**
 * @swagger
 * /client/archived:
 *   get:
 *     summary: Obtener clientes archivados
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get('/archived', authMiddleware, getArchivedClients);

/**
 * @swagger
 * /client/recover/{id}:
 *   patch:
 *     summary: Recuperar un cliente archivado
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente recuperado correctamente
 */
router.patch('/recover/:id', authMiddleware, recoverClient);

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 */
router.get('/:id', authMiddleware, getClientById);

/**
 * @swagger
 * /client/{id}:
 *   delete:
 *     summary: Eliminar un cliente (soft o hard)
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: true para soft delete, false para hard delete
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 */
router.delete('/:id', authMiddleware, deleteClient);

module.exports = router;

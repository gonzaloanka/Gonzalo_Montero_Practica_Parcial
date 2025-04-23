const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProject,
  updateProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  getArchivedProjects,
  recoverProject
} = require('../controllers/project');
const {
  projectValidator,
  updateProjectValidator
} = require('../validators/projectValidator');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 */
router.post('/',
  authMiddleware,
  projectValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  createProject
);

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Actualizar un proyecto existente
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProject'
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 */
router.put('/:id',
  authMiddleware,
  updateProjectValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  updateProject
);

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Obtener todos los proyectos
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get('/', authMiddleware, getAllProjects);

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 */
router.get('/:id', authMiddleware, getProjectById);

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft o hard)
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: true para soft delete, false para hard delete
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente
 */
router.delete('/:id', authMiddleware, deleteProject);

/**
 * @swagger
 * /project/archived:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get('/archived', authMiddleware, getArchivedProjects);

/**
 * @swagger
 * /project/recover/{id}:
 *   patch:
 *     summary: Recuperar un proyecto archivado
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto recuperado correctamente
 */
router.patch('/recover/:id', authMiddleware, recoverProject);

module.exports = router;


const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const { deliveryNoteValidator } = require('../validators/deliveryNoteValidator');
const upload = require('../middleware/storageMiddleware');

const {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNoteById,
  getDeliveryNotePdf,
  signDeliveryNote,
  deleteDeliveryNote
} = require('../controllers/deliveryNote');

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un albarán
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeliveryNote'
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/',
  authMiddleware,
  deliveryNoteValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  createDeliveryNote
);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Obtener todos los albaranes del usuario o compañía
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *       500:
 *         description: Error del servidor
 */
router.get('/', authMiddleware, getAllDeliveryNotes);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del albarán
 *       404:
 *         description: No encontrado o sin permisos
 */
router.get('/:id', authMiddleware, getDeliveryNoteById);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar el PDF del albarán
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado o descargado desde IPFS
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/pdf/:id', authMiddleware, getDeliveryNotePdf);

/**
 * @swagger
 * /api/deliverynote/sign/{id}:
 *   patch:
 *     summary: Firmar un albarán subiendo la imagen a IPFS
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignedDeliveryNoteResponse'
 *       403:
 *         description: Ya firmado o sin permisos
 */
router.patch('/sign/:id', authMiddleware, upload.single('signature'), signDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       403:
 *         description: No se puede eliminar un albarán firmado
 *       404:
 *         description: No encontrado o sin permisos
 */
router.delete('/:id', authMiddleware, deleteDeliveryNote);

module.exports = router;

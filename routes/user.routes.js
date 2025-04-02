const express = require('express');
const router = express.Router();
const { register, validateEmail, login, updatePersonalData, updateCompanyData, uploadLogo, getUser, deleteUser } = require('../controllers/auth');
const { registerValidator, validateEmailCodeValidator, loginValidator, personalDataValidator, companyDataValidator } = require('../validators/authValidator');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadLogo');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       409:
 *         description: Email ya existente
 */
router.post('/register', registerValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}, register);

/**
 * @swagger
 * /validate:
 *   put:
 *     summary: Validación de email mediante código
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email validado correctamente
 */
router.put('/validate',
  authMiddleware,
  validateEmailCodeValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  validateEmail
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicio de sesión de usuario
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login',
  loginValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  login
);

/**
 * @swagger
 * /register:
 *   put:
 *     summary: Onboarding - completar datos personales
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               nif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos personales actualizados
 */
router.put('/register',
  authMiddleware,
  personalDataValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  updatePersonalData
);

/**
 * @swagger
 * /company:
 *   patch:
 *     summary: Onboarding - completar datos de la compañía
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: string
 *               isFreelancer:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Datos de la compañía actualizados
 */
router.patch('/company',
  authMiddleware,
  companyDataValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  updateCompanyData
);

/**
 * @swagger
 * /logo:
 *   patch:
 *     summary: Subir logo del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido correctamente
 */
router.patch('/logo',
  authMiddleware,
  upload.single('logo'),
  uploadLogo
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 */
router.get('/', authMiddleware, getUser);

/**
 * @swagger
 * /:
 *   delete:
 *     summary: Eliminar usuario autenticado (soft o hard)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: soft
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Si se pasa como false, se borra físicamente
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete('/', authMiddleware, deleteUser);

module.exports = router;


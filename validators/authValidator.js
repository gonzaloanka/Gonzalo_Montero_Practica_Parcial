const { body } = require('express-validator');

exports.registerValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
];
exports.validateEmailCodeValidator = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos'),
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

exports.personalDataValidator = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('lastname').notEmpty().withMessage('Los apellidos son obligatorios'),
  body('nif').notEmpty().withMessage('El NIF es obligatorio'),
];

exports.companyDataValidator = [
  body('name').notEmpty().withMessage('Nombre de la empresa requerido'),
  body('cif').notEmpty().withMessage('CIF requerido'),
  body('address').notEmpty().withMessage('Dirección requerida'),
  body('isFreelancer').isBoolean().withMessage('isFreelancer debe ser true o false'),
];



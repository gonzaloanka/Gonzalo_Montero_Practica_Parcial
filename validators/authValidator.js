const { body } = require('express-validator');

exports.registerValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
];
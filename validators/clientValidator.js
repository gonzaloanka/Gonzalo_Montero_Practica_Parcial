const { check } = require('express-validator');

const clientValidator = [
  check('name').notEmpty().withMessage('El nombre es obligatorio'),
  check('email').optional().isEmail().withMessage('Email inválido'),
  check('phone').optional().isString(),
  check('address').optional().isString()
];

module.exports = { clientValidator };

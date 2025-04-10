const { check } = require('express-validator');

const clientValidator = [
  check('name').notEmpty().withMessage('El nombre es obligatorio'),
  check('email').optional().isEmail(),
  check('phone').optional().isString(),
  check('address').optional().isString()
];

const updateClientValidator = [
  check('name').notEmpty().withMessage('El nombre del cliente es obligatorio'),
  check('email').optional().isEmail().withMessage('Debe ser un email válido'),
  check('phone').optional().isString(),
  check('address').optional().isString()
];

module.exports = {
  clientValidator,
  updateClientValidator
};

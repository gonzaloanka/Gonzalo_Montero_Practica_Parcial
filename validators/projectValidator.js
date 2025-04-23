const { check } = require('express-validator');

const projectValidator = [
  check('name', 'El nombre del proyecto es obligatorio').notEmpty(),
  check('description').optional().isString(),
  check('client', 'Debe especificarse un ID de cliente válido').isMongoId()
];

const updateProjectValidator = [
  check('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  check('description').optional().isString(),
  check('client').optional().isMongoId().withMessage('Client ID inválido')
];

module.exports = {
  projectValidator,
  updateProjectValidator
};


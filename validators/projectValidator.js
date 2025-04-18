const { check } = require('express-validator');

const projectValidator = [
  check('name', 'El nombre del proyecto es obligatorio').notEmpty(),
  check('description').optional().isString(),
  check('client', 'Debe especificarse un ID de cliente válido').isMongoId()
];

module.exports = { projectValidator };

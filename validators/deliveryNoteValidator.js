const { check } = require('express-validator');

const deliveryNoteValidator = [
  check('project', 'El proyecto es obligatorio').notEmpty(),
  check('type', 'El tipo debe ser "hours" o "materials"').isIn(['hours', 'materials']),
  check('entries', 'Debe ser un array de entradas').isArray({ min: 1 }),
  check('entries.*.description', 'Cada entrada debe tener una descripción').notEmpty(),
  check('entries.*.quantity', 'Cada entrada debe tener una cantidad válida').isNumeric(),
  check('entries.*.unit', 'Cada entrada debe tener una unidad').notEmpty()
];

module.exports = {
  deliveryNoteValidator
};

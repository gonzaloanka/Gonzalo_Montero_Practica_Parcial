const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createClient, updateClient } = require('../controllers/client');
const { clientValidator } = require('../validators/clientValidator');
const { validationResult } = require('express-validator');
const { updateClientValidator } = require('../validators/clientValidator');

router.post('/',
  authMiddleware,
  clientValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  createClient
);

router.put('/:id',
  authMiddleware,
  updateClientValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  updateClient
);


module.exports = router;

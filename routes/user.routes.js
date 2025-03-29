const express = require('express');
const router = express.Router();
const { register } = require('../controllers/auth');
const { registerValidator } = require('../validators/authValidator');
const { validationResult } = require('express-validator');

router.post('/register', registerValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}, register);

module.exports = router;

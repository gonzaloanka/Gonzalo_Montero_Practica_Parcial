const express = require('express');
const router = express.Router();
const { register, validateEmail } = require('../controllers/auth');
const { registerValidator, validateEmailCodeValidator } = require('../validators/authValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');


router.post('/register', registerValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}, register);

module.exports = router;

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
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createDeliveryNote } = require('../controllers/deliveryNote');
const { validationResult } = require('express-validator');
const { deliveryNoteValidator } = require('../validators/deliveryNoteValidator');

router.post('/',
  authMiddleware,
  deliveryNoteValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  createDeliveryNote
);

module.exports = router;

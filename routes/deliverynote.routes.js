const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const { deliveryNoteValidator } = require('../validators/deliveryNoteValidator');
const upload = require('../middleware/storageMiddleware');

const {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNoteById,
  getDeliveryNotePdf,
  signDeliveryNote
} = require('../controllers/deliveryNote');

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

router.get('/', authMiddleware, getAllDeliveryNotes);

router.get('/:id', authMiddleware, getDeliveryNoteById);

router.get('/pdf/:id', authMiddleware, getDeliveryNotePdf);

router.patch('/sign/:id', authMiddleware, upload.single('signature'), signDeliveryNote);

module.exports = router;

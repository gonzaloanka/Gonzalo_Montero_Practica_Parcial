const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createClient, updateClient, getAllClients, getClientById } = require('../controllers/client');
const { clientValidator } = require('../validators/clientValidator');
const { validationResult } = require('express-validator');
const { updateClientValidator } = require('../validators/clientValidator');
const { deleteClient } = require('../controllers/client');
const { getArchivedClients, recoverClient } = require('../controllers/client');



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

router.get('/', authMiddleware, getAllClients);
router.get('/archived', authMiddleware, getArchivedClients);
router.patch('/recover/:id', authMiddleware, recoverClient);
router.get('/:id', authMiddleware, getClientById);




router.delete('/:id',
  authMiddleware,
  deleteClient
);



module.exports = router;

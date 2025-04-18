const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject } = require('../controllers/project');
const { projectValidator } = require('../validators/projectValidator');
const { validationResult } = require('express-validator');

router.post('/',
  authMiddleware,
  projectValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  createProject
);

module.exports = router;

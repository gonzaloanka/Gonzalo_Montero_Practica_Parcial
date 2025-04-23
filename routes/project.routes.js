const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject } = require('../controllers/project');
const { projectValidator } = require('../validators/projectValidator');
const { validationResult } = require('express-validator');
const { updateProject } = require('../controllers/project');
const { updateProjectValidator } = require('../validators/projectValidator');
const { getAllProjects, getProjectById } = require('../controllers/project');
const { deleteProject } = require('../controllers/project');

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


router.put('/:id',
  authMiddleware,
  updateProjectValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  updateProject
);

router.get('/', authMiddleware, getAllProjects);
router.get('/:id', authMiddleware, getProjectById);

router.delete('/:id', authMiddleware, deleteProject);

module.exports = router;

const Project = require('../models/Project');

const createProject = async (req, res) => {
  const { name, description, client } = req.body;
  const user = req.user;

  try {
    const existing = await Project.findOne({
      name,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    if (existing) {
      return res.status(409).json({ error: 'Este proyecto ya existe para tu usuario o compañía' });
    }

    const newProject = await Project.create({
      name,
      description,
      createdBy: user._id,
      client,
      company: user.company
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createProject };

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
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, client } = req.body;
  const user = req.user;

  try {
    const project = await Project.findOne({
      _id: id,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado o no autorizado' });
    }

    if (name && name !== project.name) {
      const existing = await Project.findOne({
        name,
        _id: { $ne: id },
        $or: [
          { createdBy: user._id },
          { company: user.company }
        ]
      });

      if (existing) {
        return res.status(409).json({ error: 'Ya existe otro proyecto con ese nombre' });
      }

      project.name = name;
    }

    if (description !== undefined) project.description = description;
    if (client !== undefined) project.client = client;

    await project.save();
    res.status(200).json(project);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProjects = async (req, res) => {
  const user = req.user;

  try {
    const projects = await Project.find({
      deleted: false,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    }).populate('client'); // Opcional: incluir datos del cliente

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjectById = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const project = await Project.findOne({
      _id: id,
      deleted: false,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    }).populate('client');

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado o no autorizado' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  const soft = req.query.soft !== 'false';
  const user = req.user;

  try {
    const project = await Project.findOne({
      _id: id,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado o no autorizado' });
    }

    if (soft) {
      project.deleted = true;
      await project.save();
      return res.status(200).json({ message: 'Proyecto archivado correctamente (soft delete)' });
    } else {
      await project.deleteOne();
      return res.status(200).json({ message: 'Proyecto eliminado permanentemente (hard delete)' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createProject,
  updateProject,
  getAllProjects,
  getProjectById,
  deleteProject
};



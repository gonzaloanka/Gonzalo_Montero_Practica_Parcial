const Client = require('../models/Client');

const createClient = async (req, res) => {
  const { name, email, phone, address } = req.body;
  const user = req.user;

  try {
    const existing = await Client.findOne({
      name,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    if (existing) {
      return res.status(409).json({ error: 'Este cliente ya existe para tu usuario o compañía' });
    }

    const newClient = await Client.create({
      name,
      email,
      phone,
      address,
      createdBy: user._id,
      company: user.company
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const user = req.user;

  try {
    const client = await Client.findOne({
      _id: id,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o no autorizado' });
    }

    client.name = name;
    if (email !== undefined) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (address !== undefined) client.address = address;

    await client.save();

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllClients = async (req, res) => {
  const user = req.user;

  try {
    const clients = await Client.find({
      deleted: false,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClientById = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const client = await Client.findOne({
      _id: id,
      deleted: false,
      $or: [
        { createdBy: user._id },
        { company: user.company }
      ]
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o no autorizado' });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClient,
  updateClient,
  getAllClients,
  getClientById
};


module.exports = {
  createClient,
  updateClient,
  getAllClients,
  getClientById
};

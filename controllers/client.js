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

module.exports = { createClient };

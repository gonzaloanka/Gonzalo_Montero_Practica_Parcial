const DeliveryNote = require('../models/DeliveryNote');

const createDeliveryNote = async (req, res) => {
  const { project, type, entries } = req.body;
  const user = req.user;

  try {
    const newNote = await DeliveryNote.create({
      project,
      user: user._id,
      type,
      entries
    });

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDeliveryNote
};

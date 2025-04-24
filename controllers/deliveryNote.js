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

const getAllDeliveryNotes = async (req, res) => {
    try {
      const user = req.user;
      const deliveryNotes = await DeliveryNote.find({
        deleted: false,
        $or: [
          { user: user._id },
          { company: user.company }
        ]
      })
        .populate({
          path: 'project',
          populate: {
            path: 'client',
          }
        })
        .populate('user');
  
      res.status(200).json(deliveryNotes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
  createDeliveryNote,
  getAllDeliveryNotes
};

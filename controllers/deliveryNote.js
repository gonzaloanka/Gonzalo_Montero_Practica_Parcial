const DeliveryNote = require('../models/DeliveryNote');
const path = require('path');
const { generateDeliveryNotePdf } = require('../utils/pdfGenerator');
const { uploadToIPFS } = require('../utils/pinata');

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

  const getDeliveryNoteById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
  
    try {
      const note = await DeliveryNote.findOne({
        _id: id,
        $or: [
          { user: user._id },
          { company: user.company }
        ]
      })
        .populate({
          path: 'user',
          select: 'personal company email'
        })
        .populate({
          path: 'project',
          populate: {
            path: 'client',
            select: 'name email phone address company'
          }
        });
  
      if (!note) {
        return res.status(404).json({ error: 'Albarán no encontrado o no autorizado' });
      }
  
      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const getDeliveryNotePdf = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const deliveryNote = await DeliveryNote.findOne({
      _id: id,
      deleted: false,
      $or: [
        { user: user._id },
        { company: user.company }
      ]
    }).populate('project').populate('user').populate('project.client');

    if (!deliveryNote) {
      return res.status(404).json({ error: 'Albarán no encontrado o no autorizado' });
    }

    const filePath = path.join(__dirname, `../storage/deliverynotes/albaran-${id}.pdf`);
    await generateDeliveryNotePdf(deliveryNote, filePath);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const signDeliveryNote = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const deliveryNote = await DeliveryNote.findOne({
      _id: id,
      deleted: false,
      signed: false,
      $or: [
        { user: user._id },
        { company: user.company }
      ]
    });

    if (!deliveryNote) {
      return res.status(404).json({ error: 'Albarán no encontrado o no autorizado o ya firmado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen de firma' });
    }

    const filePath = req.file.path;
    const ipfsHash = await uploadToIPFS(filePath);
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    deliveryNote.signed = true;
    deliveryNote.signatureUrl = ipfsUrl;
    await deliveryNote.save();

    res.status(200).json({ message: 'Albarán firmado correctamente', ipfsUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNoteById,
  getDeliveryNotePdf,
  signDeliveryNote
};

const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  type: { type: String, enum: ['hour', 'material'], required: true },
  description: String,
  quantity: Number,
  unit: String
}, { _id: false });

const DeliveryNoteSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [EntrySchema],
  signed: { type: Boolean, default: false },
  signatureUrl: String,
  pdfUrl: String,
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryNote', DeliveryNoteSchema);
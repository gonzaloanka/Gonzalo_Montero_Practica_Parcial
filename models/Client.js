const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: {
    name: { type: String },
    cif: { type: String },
    address: { type: String },
    isFreelancer: { type: Boolean }
  },
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', ClientSchema);

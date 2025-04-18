const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
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

module.exports = mongoose.model('Project', ProjectSchema);

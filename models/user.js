const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'validated'], default: 'pending' },
  role: { type: String, default: 'user' },
  code: String,
  maxAttempts: { type: Number, default: 3 },
  personal: {
    name: String,
    lastname: String,
    nif: String,
  },
  company: {
    name: String,
    cif: String,
    address: String,
    isFreelancer: Boolean,
  },
  logoUrl: String,
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);

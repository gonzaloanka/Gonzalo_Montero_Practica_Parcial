const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { generateCode } = require('../utils/generateCode');
const { hashPassword } = require('../utils/hashPassword');

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing && existing.status === 'validated') {
      return res.status(409).json({ message: 'Email ya registrado y validado' });
    }

    const hashed = await hashPassword(password);
    const code = generateCode();
    const newUser = await User.create({
      email,
      password: hashed,
      code,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

    res.status(201).json({
      email: newUser.email,
      status: newUser.status,
      role: newUser.role,
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const User = require('../models/User');
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

exports.validateEmail = async (req, res) => {
  const { code } = req.body;
  const user = req.user;

  if (user.status === 'validated') {
    return res.status(400).json({ message: 'El email ya ha sido validado' });
  }

  if (user.code === code) {
    user.status = 'validated';
    user.code = null;
    user.maxAttempts = 0;
    await user.save();
    return res.status(200).json({ message: 'Email validado correctamente' });
  } else {
    user.maxAttempts -= 1;
    await user.save();

    if (user.maxAttempts <= 0) {
      return res.status(403).json({ message: 'Demasiados intentos fallidos' });
    }

    return res.status(400).json({ message: 'Código incorrecto' });
  }
};

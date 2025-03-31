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

const { comparePassword } = require('../utils/hashPassword');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.status !== 'validated') {
      return res.status(403).json({ message: 'Email no validado aún' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePersonalData = async (req, res) => {
  const { name, lastname, nif } = req.body;
  const user = req.user;

  try {
    user.personal = { name, lastname, nif };
    await user.save();

    res.status(200).json({
      message: 'Datos personales actualizados correctamente',
      personal: user.personal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCompanyData = async (req, res) => {
  const { name, cif, address, isFreelancer } = req.body;
  const user = req.user;

  try {
    if (isFreelancer) {
      user.company = {
        name: user.personal.name + ' ' + user.personal.lastname,
        cif: user.personal.nif,
        address,
        isFreelancer: true,
      };
    } else {
      user.company = {
        name,
        cif,
        address,
        isFreelancer: false,
      };
    }

    await user.save();

    res.status(200).json({
      message: 'Datos de la compañía actualizados correctamente',
      company: user.company,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadLogo = async (req, res) => {
  const user = req.user;

  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
  }

  const imageUrl = `/storage/logos/${req.file.filename}`;
  user.logoUrl = imageUrl;

  try {
    await user.save();
    res.status(200).json({
      message: 'Logo subido correctamente',
      logoUrl: imageUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  const user = req.user;

  res.status(200).json({
    email: user.email,
    status: user.status,
    role: user.role,
    personal: user.personal,
    company: user.company,
    logoUrl: user.logoUrl
  });
};

exports.deleteUser = async (req, res) => {
  const user = req.user;
  const soft = req.query.soft !== 'false'; // por defecto true

  try {
    if (soft) {
      user.deleted = true;
      await user.save();
      return res.status(200).json({ message: 'Usuario desactivado (soft delete)' });
    } else {
      await User.deleteOne({ _id: user._id });
      return res.status(200).json({ message: 'Usuario eliminado permanentemente' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

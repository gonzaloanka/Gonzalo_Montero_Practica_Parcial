const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Cargar las variables de entorno desde el archivo .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
  }
};

module.exports = connectDB;
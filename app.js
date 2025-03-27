const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/mongo');
const routes = require('./routes/index'); // Importamos las rutas

dotenv.config(); // Cargar las variables de entorno desde .env

const app = express();

// Conectar a la base de datos MongoDB
connectDB();

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());

// Usar las rutas definidas en routes/index.js
app.use('/', routes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

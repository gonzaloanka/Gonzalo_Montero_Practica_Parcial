const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/mongo');
const setupSwagger = require('./docs/swaggerConfig');

dotenv.config();
const app = express();
setupSwagger(app);

app.use(cors());
app.use(express.json());

app.use('/api/user', require('./routes/user.routes'));
app.use('/api/client', require('./routes/client.routes'));
app.use('/api/project', require('./routes/project.routes'));

connectDB();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});

module.exports = { app, server };


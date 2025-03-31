const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/mongo');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', require('./routes/user.routes'));

connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

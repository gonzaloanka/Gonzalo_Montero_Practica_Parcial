const express = require('express');
const router = express.Router();

// Importa aquí tus rutas individuales
const userRoutes = require('./user.routes');

// Asigna las rutas
router.use('/api/user', userRoutes); // Todo lo relacionado con usuarios irá aquí

module.exports = router;

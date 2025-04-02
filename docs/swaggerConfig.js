const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestión de Usuarios - Práctica Final 2025',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000/api/user' }
    ],
  },
  apis: ['./routes/*.js'], // analizamos solo los comentarios de rutas
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;

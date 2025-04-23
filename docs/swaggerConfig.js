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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        RegisterUser: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              example: 'gonzalo@mail.com'
            },
            password: {
              type: 'string',
              example: '12345678'
            }
          }
        },
        ValidateEmailCode: {
          type: 'object',
          required: ['code'],
          properties: {
            code: {
              type: 'string',
              example: '493013'
            }
          }
        },
        LoginUser: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              example: 'gonzalo@mail.com'
            },
            password: {
              type: 'string',
              example: '12345678'
            }
          }
        },
        PersonalData: {
          type: 'object',
          required: ['name', 'lastname', 'nif'],
          properties: {
            name: {
              type: 'string',
              example: 'Gonzalo'
            },
            lastname: {
              type: 'string',
              example: 'Montero Sierra'
            },
            nif: {
              type: 'string',
              example: '12345678A'
            }
          }
        },
        CompanyData: {
          type: 'object',
          required: ['name', 'cif', 'address', 'isFreelancer'],
          properties: {
            name: {
              type: 'string',
              example: 'Mi Empresa SL'
            },
            cif: {
              type: 'string',
              example: 'B12345678'
            },
            address: {
              type: 'string',
              example: 'Calle Empresa 42'
            },
            isFreelancer: {
              type: 'boolean',
              example: false
            }
          }
        },
        UploadLogo: {
          type: 'object',
          properties: {
            logo: {
              type: 'string',
              format: 'binary'
            }
          }
        },
        Client: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              example: 'Cliente Ejemplo S.L.'
            },
            email: {
              type: 'string',
              example: 'cliente@empresa.com'
            },
            phone: {
              type: 'string',
              example: '666777888'
            },
            address: {
              type: 'string',
              example: 'Calle del Cliente 123'
            }
          }
        },
        Project: {
          type: 'object',
          required: ['name', 'description', 'client'],
          properties: {
            name: {
              type: 'string',
              example: 'Proyecto Feria'
            },
            description: {
              type: 'string',
              example: 'Organización de evento en la Feria de Abril'
            },
            client: {
              type: 'string',
              example: '60f7cbb8c2a4f10017486abc'
            }
          }
        },
        UpdateProject: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Proyecto Feria (actualizado)'
            },
            description: {
              type: 'string',
              example: 'Descripción nueva del proyecto'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;

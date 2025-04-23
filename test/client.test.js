// Este archivo contiene los tests automatizados relacionados con la gestión de clientes en la práctica final.
const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const usersModel = require('../models/User');
const clientsModel = require('../models/Client');
const { hashPassword } = require('../utils/hashPassword');
const { tokenSign } = require('../utils/handleJwt.js');

const api = supertest(app);

let token;
let clientId;
let userData;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});

  const user = await usersModel.create({
    email: 'cliente@correo.com',
    password: await hashPassword('12345678'),
    status: 'validated',
    company: {
      name: 'Mi Empresa S.L.',
      cif: 'B12345678',
      address: 'Calle Empresa 42',
      isFreelancer: false
    }
  });

  userData = user;
  token = await tokenSign(user, process.env.JWT_SECRET);
});

describe('POST /api/client', () => {
  it('debería crear un cliente correctamente', async () => {
    const newClient = {
      name: 'Cliente Prueba S.L.',
      email: 'cliente@prueba.com',
      phone: '123456789',
      address: 'Calle del Cliente 123'
    };

    const response = await api
      .post('/api/client')
      .auth(token, { type: 'bearer' })
      .send(newClient)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.body.name).toBe(newClient.name);
    clientId = response.body._id;
  });
});

describe('PUT /api/client/:id', () => {
  it('debería actualizar el cliente correctamente', async () => {
    const update = {
      name: 'Cliente Actualizado S.L.',
      phone: '987654321'
    };

    const response = await api
      .put(`/api/client/${clientId}`)
      .auth(token, { type: 'bearer' })
      .send(update)
      .expect(200);

    expect(response.body.name).toBe(update.name);
    expect(response.body.phone).toBe(update.phone);
  });
});

describe('GET /api/client', () => {
  it('debería obtener todos los clientes', async () => {
    const response = await api
      .get('/api/client')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /api/client/:id', () => {
  it('debería obtener un cliente por ID', async () => {
    const response = await api
      .get(`/api/client/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('_id');
    expect(response.body._id).toBe(clientId);
  });
});

describe('DELETE /api/client/:id (soft)', () => {
  it('debería archivar el cliente correctamente', async () => {
    const response = await api
      .delete(`/api/client/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body.message).toBe('Cliente archivado correctamente (soft delete)');
  });
});

describe('GET /api/client/archived', () => {
  it('debería listar los clientes archivados', async () => {
    const response = await api
      .get('/api/client/archived')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body.some(client => client._id === clientId)).toBe(true);
  });
});

describe('PATCH /api/client/recover/:id', () => {
  it('debería recuperar un cliente archivado', async () => {
    const response = await api
      .patch(`/api/client/recover/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body.message).toBe('Cliente recuperado correctamente');
  });
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

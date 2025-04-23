// Este archivo contiene todos los tests automatizados relacionados con la gestión de proyectos.
const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const usersModel = require('../models/User');
const clientsModel = require('../models/Client');
const projectsModel = require('../models/Project');
const { hashPassword } = require('../utils/hashPassword');
const { tokenSign } = require('../utils/handleJwt.js');

const api = supertest(app);

let token;
let userData;
let clientData;
let projectId;

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URI);
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await projectsModel.deleteMany({});

  const password = await hashPassword('testpassword');
  userData = await usersModel.create({
    email: 'proyecto@correo.com',
    password,
    status: 'validated'
  });

  token = await tokenSign(userData, process.env.JWT_SECRET);

  clientData = await clientsModel.create({
    name: 'Cliente Proyecto',
    createdBy: userData._id,
    company: userData.company
  });
});

describe('POST /api/project', () => {
  it('debería crear un proyecto correctamente', async () => {
    const project = {
      name: 'Proyecto Test',
      description: 'Descripción de prueba',
      client: clientData._id.toString()
    };

    const response = await api
      .post('/api/project')
      .auth(token, { type: 'bearer' })
      .send(project)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe(project.name);
    projectId = response.body._id;
  });
});

describe('PUT /api/project/:id', () => {
  it('debería actualizar el proyecto correctamente', async () => {
    const update = {
      name: 'Proyecto Test Actualizado',
      description: 'Descripción actualizada'
    };

    const response = await api
      .put(`/api/project/${projectId}`)
      .auth(token, { type: 'bearer' })
      .send(update)
      .expect(200);

    expect(response.body.name).toBe(update.name);
  });
});

describe('GET /api/project', () => {
  it('debería obtener todos los proyectos', async () => {
    const response = await api
      .get('/api/project')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /api/project/:id', () => {
  it('debería obtener un proyecto por ID', async () => {
    const response = await api
      .get(`/api/project/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('_id', projectId);
  });
});

describe('DELETE /api/project/:id (soft)', () => {
  it('debería archivar el proyecto correctamente', async () => {
    const response = await api
      .delete(`/api/project/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body.message).toMatch(/archivado/);
  });
});

describe('PATCH /api/project/recover/:id', () => {
  it('debería recuperar un proyecto archivado', async () => {
    const response = await api
      .patch(`/api/project/recover/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body.message).toMatch(/recuperado/);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});
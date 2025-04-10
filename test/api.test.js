const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const usersModel = require('../models/User');
const { hashPassword } = require('../utils/hashPassword');
const { tokenSign } = require('../utils/handleJwt.js');

const api = supertest(app);

const initialUsers = [
  {
    email: "marcos@correo.es",
    password: "mipassword"
  }
];

let token;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));

  await usersModel.deleteMany({});

  const password = await hashPassword(initialUsers[0].password);
  const body = { ...initialUsers[0], password };

  const userData = await usersModel.create(body);
  userData.set("password", undefined, { strict: false });

  token = await tokenSign(userData, process.env.JWT_SECRET);
});

it('should get current user', async () => {
    const response = await api.get('/api/user')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect('Content-Type', /application\/json/);
  
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe(initialUsers[0].email);
  });
  

  describe('POST /api/user/register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      const newUser = {
        email: 'nuevo@correo.com',
        password: 'contraseñaSegura123'
      };
  
      const response = await api
        .post('/api/user/register')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(newUser.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body.status).toBe('pending');
      expect(response.body.role).toBe('user');
    });
  
    it('debería fallar si el email ya está registrado', async () => {
      const repeatedUser = {
        email: 'nuevo@correo.com',
        password: 'otraContraseña123'
      };
  
      const response = await api
        .post('/api/user/register')
        .send(repeatedUser)
        .expect(409);
  
      expect(response.body).toHaveProperty('error');
    });
  
    it('debería fallar si el email no es válido', async () => {
      const invalidUser = {
        email: 'correoSinArroba',
        password: '12345678'
      };
  
      const response = await api
        .post('/api/user/register')
        .send(invalidUser)
        .expect(400);
  
      expect(response.body).toHaveProperty('errors');
    });
  
    it('debería fallar si la contraseña es demasiado corta', async () => {
      const weakUser = {
        email: 'corto@correo.com',
        password: '123'
      };
  
      const response = await api
        .post('/api/user/register')
        .send(weakUser)
        .expect(400);
  
      expect(response.body).toHaveProperty('errors');
    });
  });
  

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});



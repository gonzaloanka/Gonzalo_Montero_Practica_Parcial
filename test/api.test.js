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
let userData;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});

  const password = await hashPassword(initialUsers[0].password);
  const body = { ...initialUsers[0], password };

  userData = await usersModel.create(body);
  userData.status = 'validated';
  await userData.save();

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

  describe('POST /api/user/login', () => {
    it('debería hacer login correctamente y devolver token', async () => {
      const response = await api
        .post('/api/user/login')
        .send({
          email: initialUsers[0].email,
          password: initialUsers[0].password
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(initialUsers[0].email);
    });
  
    it('debería fallar si el email no existe', async () => {
      await api
        .post('/api/user/login')
        .send({
          email: 'inexistente@mail.com',
          password: 'cualquiera123'
        })
        .expect(404);
    });
  
    it('debería fallar si la contraseña es incorrecta', async () => {
      await api
        .post('/api/user/login')
        .send({
          email: initialUsers[0].email,
          password: 'incorrecta'
        })
        .expect(401);
    });
  
    it('debería fallar si faltan campos', async () => {
      await api
        .post('/api/user/login')
        .send({ email: '' })
        .expect(400);
    });
  });
  
  describe('PUT /api/user/register (onboarding - datos personales)', () => {
    it('debería actualizar los datos personales del usuario', async () => {
      const personalData = {
        name: 'Gonzalo',
        lastname: 'Montero Sierra',
        nif: '12345678A'
      };
  
      const response = await api
        .put('/api/user/register')
        .auth(token, { type: 'bearer' })
        .send(personalData)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body.message).toBe('Datos personales actualizados correctamente');
      expect(response.body.personal).toMatchObject(personalData);
    });
  
    it('debería fallar si falta el nombre', async () => {
      await api
        .put('/api/user/register')
        .auth(token, { type: 'bearer' })
        .send({
          lastname: 'Montero Sierra',
          nif: '12345678A'
        })
        .expect(400);
    });
  
    it('debería fallar si falta el NIF', async () => {
      await api
        .put('/api/user/register')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Gonzalo',
          lastname: 'Montero Sierra'
        })
        .expect(400);
    });
  });
  
  describe('PATCH /api/user/company (onboarding - datos empresa)', () => {
    it('debería actualizar los datos de la compañía correctamente', async () => {
      const companyData = {
        name: 'Empresa S.L.',
        cif: 'B12345678',
        address: 'Calle de la Feria 33',
        isFreelancer: false
      };
  
      const response = await api
        .patch('/api/user/company')
        .auth(token, { type: 'bearer' })
        .send(companyData)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(response.body.message).toBe('Datos de la compañía actualizados correctamente');
      expect(response.body.company).toMatchObject(companyData);
    });
  
    it('debería usar los datos personales si el usuario es autónomo', async () => {
      const response = await api
        .patch('/api/user/company')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'IGNORADO',
          cif: 'IGNORADO',
          address: 'Calle Autónomo 9',
          isFreelancer: true
        })
        .expect(200);
  
      expect(response.body.company.isFreelancer).toBe(true);
      expect(response.body.company.address).toBe('Calle Autónomo 9');
      expect(response.body.company.name).toBe('Gonzalo Montero Sierra');
      expect(response.body.company.cif).toBe('12345678A');
    });
  
    it('debería fallar si faltan campos obligatorios', async () => {
      await api
        .patch('/api/user/company')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Falta CIF',
          address: 'Dirección sin CIF',
          isFreelancer: false
        })
        .expect(400);
    });
  });

  const fs = require('fs');
const path = require('path');

describe('PATCH /api/user/logo', () => {
  it('debería subir un logo correctamente', async () => {
    const filePath = path.join(__dirname, '../storage/logos/logo.png');

    const response = await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .attach('logo', filePath)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('Logo subido correctamente');
    expect(response.body).toHaveProperty('logoUrl');
  });

  it('debería fallar si no se envía ninguna imagen', async () => {
    await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .expect(400);
  });
});

describe('DELETE /api/user', () => {
  it('debería desactivar el usuario (soft delete)', async () => {
    const response = await api
      .delete('/api/user')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('Usuario desactivado (soft delete)');

    const dbUser = await usersModel.findById(userData._id);
    expect(dbUser.deleted).toBe(true);
  });

  it('debería eliminar el usuario permanentemente (hard delete)', async () => {
    const newUser = await usersModel.create({
      email: 'eliminar@correo.com',
      password: await hashPassword('12345678'),
      status: 'validated'
    });

    const newToken = await tokenSign(newUser, process.env.JWT_SECRET);

    const response = await api
      .delete('/api/user?soft=false')
      .auth(newToken, { type: 'bearer' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.message).toBe('Usuario eliminado permanentemente');

    const deletedUser = await usersModel.findById(newUser._id);
    expect(deletedUser).toBeNull();
  });
});
  

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});



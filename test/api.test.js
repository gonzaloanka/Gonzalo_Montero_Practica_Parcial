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
  

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});



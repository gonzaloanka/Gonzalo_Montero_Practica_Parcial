const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const usersModel = require('../models/User');
const projectModel = require('../models/Project');
const clientModel = require('../models/Client');
const deliveryNoteModel = require('../models/DeliveryNote');
const { hashPassword } = require('../utils/hashPassword');
const { tokenSign } = require('../utils/handleJwt');

const api = supertest(app);

let token;
let user;
let client;
let project;
let deliveryNoteId;

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));

  await usersModel.deleteMany({});
  await projectModel.deleteMany({});
  await clientModel.deleteMany({});
  await deliveryNoteModel.deleteMany({});

  const password = await hashPassword('12345678');
  user = await usersModel.create({ email: 'test@correo.com', password, status: 'validated' });
  token = await tokenSign(user, process.env.JWT_SECRET);

  client = await clientModel.create({
    name: 'Cliente Test',
    createdBy: user._id
  });

  project = await projectModel.create({
    name: 'Proyecto Test',
    description: 'Desc test',
    client: client._id,
    user: user._id,
    createdBy: user._id
  });
});

describe('Albaranes', () => {
  it('debería crear un albarán', async () => {
    const newNote = {
      project: project._id.toString(),
      type: 'hours',
      entries: [
        {
          type: 'hour',
          description: 'Trabajo realizado',
          quantity: 5,
          unit: 'horas'
        }
      ]
    };

    const response = await api
      .post('/api/deliverynote')
      .auth(token, { type: 'bearer' })
      .send(newNote)
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.entries[0].type).toBe('hour');
    deliveryNoteId = response.body._id;
  });

  it('debería obtener todos los albaranes', async () => {
    const response = await api
      .get('/api/deliverynote')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('debería obtener un albarán por id', async () => {
    const response = await api
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('_id');
    expect(response.body._id).toBe(deliveryNoteId);
  });

  it('debería firmar un albarán y devolver URLs de firma y PDF', async () => {
    const signaturePath = path.join(__dirname, '../storage/firma-test.png');
    if (!fs.existsSync(signaturePath)) {
      fs.writeFileSync(signaturePath, 'fake image content');
    }

    const response = await api
      .patch(`/api/deliverynote/sign/${deliveryNoteId}`)
      .auth(token, { type: 'bearer' })
      .attach('signature', signaturePath)
      .expect(200);

    expect(response.body).toHaveProperty('pdfUrl');
    expect(response.body).toHaveProperty('signatureUrl');
    expect(response.body.message).toBe('Albarán firmado y PDF subido a IPFS');

    fs.unlinkSync(signaturePath);
  });

  it('debería redirigir al PDF desde IPFS si ya está firmado', async () => {
    const response = await api
      .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
      .auth(token, { type: 'bearer' })
      .expect(302);

      expect(response.headers.location).toMatch(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//);
  });

  it('no debería eliminar un albarán firmado', async () => {
    const response = await api
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .auth(token, { type: 'bearer' })
      .expect(403);

    expect(response.body.error).toBe('No se puede eliminar un albarán firmado');
  });

  it('no debería eliminar un albarán inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await api
      .delete(`/api/deliverynote/${fakeId}`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

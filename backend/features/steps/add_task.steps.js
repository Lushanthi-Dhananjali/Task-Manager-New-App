const { Given, When, Then, BeforeAll, AfterAll, Before } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const app = require('../../src/app');
const { connect, disconnect } = require('../../src/db');

let mongo;
let token;
let lastResponse;
let uname; // <- per-scenario username

BeforeAll(async function () {
  this.timeout?.(30000);
  mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'bddsecret';

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await connect(mongo.getUri());
});

/** 🆕 Reset state for each scenario */
Before(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
  token = null;
  lastResponse = null;
  // Generate a unique username (works even if you remove the DB wipe)
  uname = `bdd_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
});

AfterAll(async () => {
  try { await mongoose.connection.db.dropDatabase(); } catch {}
  await disconnect();
  await mongo.stop();
});

Given('I am a registered user', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: uname, password: '123' });
  // Accept 201 Created; if you kept DB wipe, this will always be 201
  if (res.status !== 201) throw new Error(`Expected 201 on register, got ${res.status}`);
});

Given('I am logged in', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: uname, password: '123' })
    .expect(200);
  token = res.body.token;
  assert.ok(token, 'JWT token not returned');
});

When('I add a task with title {string} and description {string}', async (title, description) => {
  lastResponse = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title, description });
});

Then('I should see a task titled {string} in my list', async (title) => {
  if (lastResponse.status !== 201) {
    throw new Error(`Expected 201 on create, got ${lastResponse.status}`);
  }
  const list = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  const found = list.body.find(t => t.title === title);
  assert.ok(found, `Task "${title}" not found in list`);
});

When('I try to add a task with title {string}', async (title) => {
  lastResponse = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title });
});

Then('I should get a 400 error', () => {
  if (lastResponse.status !== 400) {
    throw new Error(`Expected 400, got ${lastResponse.status} (body: ${JSON.stringify(lastResponse.body)})`);
  }
});

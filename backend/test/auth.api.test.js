const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  it('registers a new user (201) and returns username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret' })
      .expect(201);
    if (res.body.username !== 'alice') throw new Error('Bad username return');
  });

  it('rejects duplicate usernames (500 unless you map to 409)', async () => {
    await request(app).post('/api/auth/register').send({ username: 'bob', password: '1' }).expect(201);
    await request(app).post('/api/auth/register').send({ username: 'bob', password: '2' }).expect(500);
  });

  it('logs in and returns a JWT', async () => {
    await request(app).post('/api/auth/register').send({ username: 'charlie', password: 'pw' }).expect(201);
    const res = await request(app).post('/api/auth/login').send({ username: 'charlie', password: 'pw' }).expect(200);
    if (!res.body.token) throw new Error('No token in login response');
  });

  it('rejects wrong password (401)', async () => {
    await request(app).post('/api/auth/register').send({ username: 'dave', password: 'good' }).expect(201);
    await request(app).post('/api/auth/login').send({ username: 'dave', password: 'bad' }).expect(401);
  });
});

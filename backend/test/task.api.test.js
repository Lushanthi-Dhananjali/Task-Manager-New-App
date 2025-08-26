// test/task.api.test.js
// Requires: test/setup.js is loaded by Mocha (see package.json --file test/setup.js)

const request = require('supertest');
const app = require('../src/app');

let token;

// helper: create a fresh user + JWT for each test
async function getToken(username = 'tuser', password = 'pw') {
  await request(app).post('/api/auth/register').send({ username, password }).expect(201);
  const res = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
  return res.body.token;
}

describe('Tasks API (CRUD)', () => {
  beforeEach(async () => {
    token = await getToken();
  });

  it('CREATE: creates a task (201) with title & description', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write tests', description: 'Mocha + Supertest' })
      .expect(201);

    if (!res.body || res.body.title !== 'Write tests') {
      throw new Error('Created task not returned correctly');
    }
  });

  it('READ: lists my tasks (200) and includes the created one', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'List me', description: '' })
      .expect(201);

    const list = await request(app)
      .get('/api/tasks') // ✅ fixed quote
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const found = list.body.find(t => t._id === created.body._id);
    if (!found) throw new Error('Task not found in list');
  });

  it('UPDATE: updates title and description (200)', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Old title', description: 'Old desc' })
      .expect(201);

    const updated = await request(app)
      .put(`/api/tasks/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New title', description: 'New desc', done: false })
      .expect(200);

    if (updated.body.title !== 'New title' || updated.body.description !== 'New desc') {
      throw new Error('Update did not persist new title/description');
    }
  });

  it('DELETE: deletes a task (204)', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Temp task' })
      .expect(201);

    await request(app)
      .delete(`/api/tasks/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const list = await request(app)
      .get('/api/tasks') // ✅ fixed quote
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const stillThere = list.body.find(t => t._id === created.body._id);
    if (stillThere) throw new Error('Task was not deleted');
  });

  it('AUTHZ: rejects create without token (401)', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Nope' })
      .expect(401);
  });

  // -------------------------------
  // RED → GREEN → REFACTOR exercise
  // -------------------------------

  it('RED: rejects titles shorter than 3 chars after trim (400)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '  a ' }); // trims to "a"
    if (res.status !== 400) throw new Error('Should be 400 when title < 3 chars');
  });

  it('UPDATE validation: rejects short title on update (400)', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Valid title' })
      .expect(201);

    const upd = await request(app)
      .put(`/api/tasks/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: ' x ' }); // trims to 'x'
    if (upd.status !== 400) throw new Error('Should be 400 on short title during update');
  });
});

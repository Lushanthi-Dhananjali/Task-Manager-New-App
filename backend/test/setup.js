// test/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connect, disconnect } = require('../src/db');

let mongo;

before(async function () {
  this.timeout(30000); // allow time to download binaries first run
  mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'testsecret';

  // IMPORTANT: ensure no existing connection before connecting
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await connect(mongo.getUri());
});

beforeEach(async () => {
  // clean all collections between tests
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

after(async () => {
  try { await mongoose.connection.db.dropDatabase(); } catch {}
  await disconnect();
  if (mongo) await mongo.stop();
});

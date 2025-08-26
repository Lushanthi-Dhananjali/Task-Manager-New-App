const mongoose = require('mongoose');

async function connect(uri) {
  mongoose.set('strictQuery', true);
  // If already connected to a different URI, disconnect first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri, { dbName: 'taskmanager' });
  console.log(` MongoDB connected`);
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = { connect, disconnect };

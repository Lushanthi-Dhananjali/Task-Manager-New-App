require('dotenv').config();
const app = require('./app');
const { connect } = require('./db');

const PORT = process.env.PORT || 4000;

connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
});

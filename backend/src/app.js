const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', auth, taskRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));
module.exports = app;

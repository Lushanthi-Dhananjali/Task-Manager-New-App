// src/routes/taskRoutes.js
const router = require('express').Router();
const Task = require('../models/Task');

// CREATE
router.post('/', async (req, res) => {
  try {
    const { title, description = '' } = req.body;
    // no manual checks; let Mongoose enforce the rules
    const task = await Task.create({ title, description, owner: req.userId });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// READ
router.get('/', async (req, res) => {
  const tasks = await Task.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, done } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.userId },
      { $set: { title, description, done } },
      { new: true, runValidators: true, context: 'query' } // ensure validators run
    );
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const del = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!del) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
// src/models/Task.js
const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const taskSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 1 },
  description: { type: String, default: '' },
  done: { type: Boolean, default: false },
  owner: { type: Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Enforce: title must be at least 3 characters AFTER TRIM
taskSchema.path('title').validate(function (v) {
  return typeof v === 'string' && v.trim().length >= 3;
}, 'Title must be at least 3 characters long');

module.exports = model('Task', taskSchema);

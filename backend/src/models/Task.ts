import mongoose, { Document, Schema } from 'mongoose';
import { ParsedTask } from '../types/Task.js';

// Use Omit to exclude _id from ParsedTask to avoid conflict with Document's _id
export interface ITask extends Omit<ParsedTask, '_id'>, Document {}

const TaskSchema: Schema = new Schema({
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  assignee: {
    type: String,
    default: null,
    trim: true
  },
  dueDate: {
    type: String,
    default: null
  },
  dueTime: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['P1', 'P2', 'P3', 'P4'],
    default: 'P3'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  completed: {
    type: Boolean,
    default: false
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  originalText: {
    type: String,
    required: true
  },
  parsingMethod: {
    type: String,
    enum: ['openai', 'nlp-packages'],
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
TaskSchema.index({ createdAt: -1 });

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;
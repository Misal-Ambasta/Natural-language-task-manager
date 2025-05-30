import express from 'express';
import { parseTask, getAllTasks, getTaskById, updateTask, deleteTask, getTaskStats } from '../controllers/taskController.js';

const router = express.Router();

// Parse new task
router.post('/parse', parseTask);

// Get all tasks with filtering and pagination
router.get('/', getAllTasks);

// Get task statistics
router.get('/stats', getTaskStats);

// Get specific task by ID
router.get('/:id', getTaskById);

// Update task
router.put('/:id', updateTask);

// Delete task
router.delete('/:id', deleteTask);

export default router;
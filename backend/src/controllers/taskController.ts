import { Request, Response } from 'express';
import dotenv from 'dotenv';
import * as openaiParser from '../services/openaiParser.js';
import * as nlpParser from '../services/nlpParser.js';
import Task, { ITask } from '../models/Task.js';
dotenv.config();
// Initialize OpenAI parser
if (process.env.OPENAI_API_KEY) {
  openaiParser.initializeOpenAI(process.env.OPENAI_API_KEY);
}

// Parse task controller function
export const parseTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, method } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Text input is required'
      });
      return;
    }

    if (!method || !['openai', 'nlp-packages'].includes(method)) {
      res.status(400).json({
        success: false,
        error: 'Method must be either "openai" or "nlp-packages"'
      });
      return;
    }

    let result;
    
    if (method === 'openai') {
      result = await openaiParser.parseTask(text);
    } else {
      result = await nlpParser.parseTask(text);
    }

    // If parsing was successful, save to database
    if (result.success && result.task) {
      try {
        const newTask = new Task(result.task);
        const savedTask = await newTask.save();
        
        // Return the saved task with database ID
        res.status(201).json({
          success: true,
          task: savedTask,
          method: result.method
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({
          success: false,
          error: 'Error saving task to database',
          method: result.method
        });
      }
    } else {
      // Return parsing error
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to parse task',
        method: result.method
      });
    }
  } catch (error) {
    console.error('Task parsing error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all tasks controller function
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', priority, assignee } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query filters
    const filter: any = {};
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    
    // Build sort options
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await Task.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get task by ID controller function
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update task controller function
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate update data
    const allowedUpdates = ['taskName', 'assignee', 'dueDate', 'dueTime', 'priority', 'status', 'completed'];
    const updateKeys = Object.keys(updates);
    
    const isValidOperation = updateKeys.every(key => allowedUpdates.includes(key));
    
    if (!isValidOperation) {
      res.status(400).json({
        success: false,
        error: 'Invalid updates. Only taskName, assignee, dueDate, dueTime, priority, status, and completed can be updated.'
      });
      return;
    }
    
    // Find and update the task
    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete task controller function
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get task statistics controller function
export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Count tasks by priority
    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Count tasks by assignee
    const assigneeStats = await Task.aggregate([
      {
        $group: {
          _id: '$assignee',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Count tasks by due date (grouped by week)
    const dueDateStats = await Task.aggregate([
      {
        $match: {
          dueDate: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$dueDate',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Count tasks by parsing method
    const parsingMethodStats = await Task.aggregate([
      {
        $group: {
          _id: '$parsingMethod',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);
    
    // Total tasks count
    const totalTasks = await Task.countDocuments();
    
    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        byPriority: priorityStats,
        byAssignee: assigneeStats,
        byDueDate: dueDateStats,
        byParsingMethod: parsingMethodStats
      }
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

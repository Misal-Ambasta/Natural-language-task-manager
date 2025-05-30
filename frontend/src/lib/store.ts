import { create } from 'zustand';
import { apiRequest } from './queryClient';
import type { Task, InsertTask, UpdateTask } from '@shared/schema';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
  
  // Actions
  fetchTasks: () => Promise<void>;
  parseTask: (text: string) => Promise<any>;
  updateTask: (id: number, updates: UpdateTask) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  success: false,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('GET', '/api/tasks');
      
      // Transform tasks to combine dueDate and dueTime into dueDateTime
      const transformedTasks = response.data.tasks.map((task: Task) => {
        let dueDateTime = null;
        
        // If both dueDate and dueTime exist, combine them
        if ('dueDate' in task && 'dueTime' in task && task.dueDate && task.dueTime) {
          // Parse date and time parts
          const [year, month, day] = (task.dueDate as string).split('-').map(Number);
          const [hours, minutes] = (task.dueTime as string).split(':').map(Number);
          
          // Create a new Date object with combined date and time
          dueDateTime = new Date(year, month - 1, day, hours, minutes);
        } 
        // If only dueDate exists, set time to start of day
        else if ('dueDate' in task && task.dueDate) {
          const [year, month, day] = (task.dueDate as string).split('-').map(Number);
          dueDateTime = new Date(year, month - 1, day);
        }
        
        return {
          ...task,
          dueDateTime
        };
      });
      
      set({ tasks: transformedTasks, isLoading: false, success: true });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks', 
        isLoading: false 
      });
    }
  },
  
  parseTask: async (text: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/tasks/parse', { 
        text: text, 
        method: 'openai', 
        assignee: 'John'  
      });
      const data = response.data.tasks;
      
      // Create the task with the parsed data
      if (data) {
        // Combine dueDate and dueTime into dueDateTime if they exist
        let dueDateTime = null;
        
        if (data.dueDate && data.dueTime) {
          // Parse date and time parts
          const [year, month, day] = data.dueDate.split('-').map(Number);
          const [hours, minutes] = data.dueTime.split(':').map(Number);
          
          // Create a new Date object with combined date and time
          dueDateTime = new Date(year, month - 1, day, hours, minutes);
        } else if (data.dueDate) {
          // If only dueDate exists, set time to start of day
          const [year, month, day] = data.dueDate.split('-').map(Number);
          dueDateTime = new Date(year, month - 1, day);
        }
        await get().fetchTasks();
      }
      
      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to parse task', 
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  
  updateTask: async (id: number, updates: UpdateTask) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure assignee is John if it's being updated
      const updatesWithAssignee = updates.assignee ? { ...updates, assignee: 'John' } : updates;
      
      // Convert dueDateTime to dueDate and dueTime for backend
      const backendUpdates: any = { ...updatesWithAssignee };
      
      // Remove dueDateTime from the backend updates
      if ('dueDateTime' in backendUpdates) {
        delete backendUpdates.dueDateTime;
        
        // If dueDateTime is provided and not null, convert to dueDate and dueTime
        if (updates.dueDateTime) {
          const date = new Date(updates.dueDateTime);
          backendUpdates.dueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
          backendUpdates.dueTime = date.toTimeString().substring(0, 5); // HH:MM
        } else {
          // If dueDateTime is null, set both dueDate and dueTime to null
          backendUpdates.dueDate = null;
          backendUpdates.dueTime = null;
        }
      }
      
      // If name is provided, convert it to taskName for backend
      if (backendUpdates.name) {
        backendUpdates.taskName = backendUpdates.name;
        delete backendUpdates.name;
      }
      
      await apiRequest('PUT', `/api/tasks/${id}`, backendUpdates);
      // Refresh the task list
      await get().fetchTasks();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task', 
        isLoading: false 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest('DELETE', `/api/tasks/${id}`);
      // Refresh the task list after deletion
      await get().fetchTasks();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task', 
        isLoading: false 
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
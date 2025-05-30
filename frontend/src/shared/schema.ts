export interface Task {
  _id: number;
  taskName: string;
  assignee: string;
  dueDateTime: Date | null;
  priority: string;
  status: string;
  completed: boolean;
  createdAt: Date;
}

export interface InsertTask {
  taskName: string;
  assignee: string;
  dueDateTime?: Date;
  priority: string;
  status: string;
  completed: boolean;
}

export interface UpdateTask {
  taskName?: string;
  assignee?: string;
  dueDateTime?: Date | null;
  priority?: string;
  status?: string;
  completed?: boolean;
}
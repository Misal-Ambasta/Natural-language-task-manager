import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Check, Trash2 } from "lucide-react";
import { format, isAfter, isBefore, addHours } from "date-fns";
import type { Task } from "@shared/schema";
import { useTaskStore } from "@/lib/store";

interface TaskTableProps {
  searchQuery: string;
  assigneeFilter: string;
  priorityFilter: string;
  onEditTask: (task: Task) => void;
}

export function TaskTable({
  searchQuery,
  assigneeFilter,
  priorityFilter,
  onEditTask,
}: TaskTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const { toast } = useToast();
  const { tasks, fetchTasks, updateTask, deleteTask, isLoading, error } = useTaskStore();
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);
  useEffect(() => {
    
  }, [tasks]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
    console.log(error)
  }, [error, toast]);

  const handleCompleteTask = (task: Task) => {
    updateTask(task._id, {
      completed: !task.completed,
      status: !task.completed ? "completed" : "pending",
    });
  };

  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map((task) => task._id));
    } else {
      setSelectedTasks([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1":
        return "bg-red-100 text-red-800";
      case "P2":
        return "bg-orange-100 text-orange-800";
      case "P3":
        return "bg-yellow-100 text-yellow-800";
      case "P4":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (task: Task) => {
    if (task.completed) return "bg-green-100 text-green-800";
    if (task.dueDateTime && isAfter(new Date(), new Date(task.dueDateTime))) {
      return "bg-red-100 text-red-800";
    }
    if (task.status === "in-progress") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (task: Task) => {
    if (task.completed) return "Completed";
    if (task.dueDateTime && isAfter(new Date(), new Date(task.dueDateTime))) {
      return "Overdue";
    }
    if (task.status === "in-progress") return "In Progress";
    return "Pending";
  };

  const formatDueDate = (task: Task) => {
    if (!task.dueDateTime) return "No due date";

    const dueDate = new Date(task.dueDateTime);
    const now = new Date();

    if (isAfter(now, dueDate)) {
      const hoursOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
      );
      return (
        <div>
          <div className="text-sm text-slate-900">
            {format(dueDate, "h:mm a, d MMM")}
          </div>
          <div className="text-xs text-red-600">Overdue by {hoursOverdue}h</div>
        </div>
      );
    }

    const hoursUntil = Math.floor(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    );
    const daysUntil = Math.floor(hoursUntil / 24);

    return (
      <div>
        <div className="text-sm text-slate-900">
          {format(dueDate, "h:mm a, d MMM")}
        </div>
        <div className="text-xs text-green-600">
          {daysUntil > 0
            ? `${daysUntil}d remaining`
            : `${hoursUntil}h remaining`}
        </div>
      </div>
    );
  };

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee =
      !assigneeFilter ||
      assigneeFilter === "all" ||
      task.assignee.toLowerCase() === assigneeFilter.toLowerCase();
    const matchesPriority =
      !priorityFilter ||
      priorityFilter === "all" ||
      task.priority === priorityFilter;

    return matchesSearch && matchesAssignee && matchesPriority;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={selectedTasks.length === 0}>
              Bulk Actions
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="mt-2 text-sm text-slate-500">Loading tasks...</div>
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-sm text-slate-500">No tasks found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task._id)}
                      onCheckedChange={(checked) =>
                        handleSelectTask(task._id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      <div>
                        <div
                          className={`text-sm font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-900"}`}
                        >
                          {task.taskName}
                        </div>
                        <div className="text-sm text-slate-500">
                          Created {format(new Date(task.createdAt), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {task.assignee.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-slate-900">
                        {task.assignee}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDueDate(task)}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task)}>
                      {getStatusText(task)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTask(task)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompleteTask(task)}
                        className="text-green-600 hover:text-green-700"
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTasks.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredTasks.length}</span> of{" "}
            <span className="font-medium">{filteredTasks.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

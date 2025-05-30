import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTaskStore } from "@/lib/store"; // Import Zustand store
import type { Task, UpdateTask } from "@shared/schema";

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  // Get Zustand store methods and state
  const { updateTask, isLoading, error } = useTaskStore();
  const { toast } = useToast();

  // Helper function to combine dueDate and dueTime into datetime-local format
  const getInitialDateTime = () => {
    if (task.dueDate && task.dueTime) {
      // Combine date and time strings into a format suitable for datetime-local input
      return `${task.dueDate}T${task.dueTime}`;
    }
    return "";
  };

  const [formData, setFormData] = useState({
    taskName: task.taskName,
    assignee: task.assignee || "",
    dueDateTime: getInitialDateTime(),
    priority: task.priority,
    status: task.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Determine if task is completed based on status
      const isCompleted = formData.status === 'completed';
      
      // Prepare updates object with dueDateTime (Zustand store will handle the conversion)
      const updates: UpdateTask = {
        taskName: formData.taskName,
        assignee: formData.assignee,
        dueDateTime: formData.dueDateTime ? new Date(formData.dueDateTime) : null,
        priority: formData.priority,
        status: formData.status,
        completed: isCompleted
      };

      // Call Zustand store updateTask method
      await updateTask(task._id, updates);
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.taskName}
              onChange={(e) => handleInputChange("taskName", e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => handleInputChange("assignee", e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="dueDateTime">Due Date & Time</Label>
            <Input
              id="dueDateTime"
              type="datetime-local"
              value={formData.dueDateTime}
              onChange={(e) => handleInputChange("dueDateTime", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 - Critical</SelectItem>
                <SelectItem value="P2">P2 - High</SelectItem>
                <SelectItem value="P3">P3 - Medium</SelectItem>
                <SelectItem value="P4">P4 - Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

interface ParsedTaskEditModalProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function ParsedTaskEditModal({ task, onClose, onSave }: ParsedTaskEditModalProps) {
  const [formData, setFormData] = useState({
    name: task.taskName,
    assignee: task.assignee,
    dueDateTime: task.dueDateTime ? format(new Date(task.dueDateTime), "yyyy-MM-dd'T'HH:mm") : "",
    priority: task.priority,
    status: task.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask: Task = {
      ...task,
      taskName: formData.name,
      assignee: formData.assignee,
      dueDateTime: formData.dueDateTime ? new Date(formData.dueDateTime) : null,
      priority: formData.priority,
      status: formData.status,
    };

    onSave(updatedTask);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Parsed Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
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
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
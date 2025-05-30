import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { format } from "date-fns";
import type { InsertTask, Task } from "@shared/schema";
import { ParsedTaskEditModal } from "./parsed-task-edit-modal";

interface ParsedTask {
  name: string;
  assignee: string;
  dueDateTime: string | null;
  priority: string;
}

export function ParsePreview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: parsedTask } = useQuery<ParsedTask>({
    queryKey: ["parsedTask"],
    enabled: false, // Only show when we have parsed data
  });

  const { data: editingParsedTask } = useQuery<Task>({
    queryKey: ["editingParsedTask"],
    enabled: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      queryClient.removeQueries({ queryKey: ["parsedTask"] });
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfirmTask = () => {
    if (!parsedTask) return;

    const taskData: InsertTask = {
      name: parsedTask.name,
      assignee: parsedTask.assignee,
      dueDateTime: parsedTask.dueDateTime ? new Date(parsedTask.dueDateTime) : undefined,
      priority: parsedTask.priority,
      status: "pending",
      completed: false,
    };

    createTaskMutation.mutate(taskData);
  };

  const handleEditDetails = () => {
    if (!parsedTask) return;
    
    // Convert parsed task to a temporary task for editing
    const tempTask: Task = {
      id: -1, // Temporary ID
      name: parsedTask.name,
      assignee: parsedTask.assignee,
      dueDateTime: parsedTask.dueDateTime ? new Date(parsedTask.dueDateTime) : null,
      priority: parsedTask.priority,
      status: "pending",
      completed: false,
      createdAt: new Date(),
    };
    
    // Store the temp task for editing
    queryClient.setQueryData(["editingParsedTask"], tempTask);
  };

  if (!parsedTask) return null;

  return (
    <>
      {editingParsedTask && (
        <ParsedTaskEditModal
          task={editingParsedTask}
          onClose={() => queryClient.removeQueries({ queryKey: ["editingParsedTask"] })}
          onSave={(updatedTask: Task) => {
            // Update the parsed task with new values
            const updatedParsedTask: ParsedTask = {
              name: updatedTask.name,
              assignee: updatedTask.assignee,
              dueDateTime: updatedTask.dueDateTime ? updatedTask.dueDateTime.toISOString() : null,
              priority: updatedTask.priority,
            };
            queryClient.setQueryData(["parsedTask"], updatedParsedTask);
            queryClient.removeQueries({ queryKey: ["editingParsedTask"] });
          }}
        />
      )}
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Wand2 className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Parsed Task Preview</h4>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Task Name</label>
                  <div className="text-slate-900">{parsedTask.name}</div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Assigned To</label>
                  <div className="text-slate-900">{parsedTask.assignee}</div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Due Date/Time</label>
                  <div className="text-slate-900">
                    {parsedTask.dueDateTime 
                      ? format(new Date(parsedTask.dueDateTime), "h:mm a, d MMM")
                      : "No due date"
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Priority</label>
                  <div className="text-slate-900">
                    {parsedTask.priority}{parsedTask.priority === "P3" ? " (Default)" : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-4">
              <Button 
                variant="ghost" 
                onClick={handleEditDetails}
                className="text-blue-700 hover:text-blue-800"
              >
                Edit Details
              </Button>
              <Button 
                onClick={handleConfirmTask}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

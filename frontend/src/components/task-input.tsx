import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Clock } from "lucide-react";
import { useTaskStore } from "@/lib/store";

export function TaskInput() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { parseTask, isLoading, error, success } = useTaskStore();

  const handleParse = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await parseTask(input);
      // Store parsed task for preview
      if (success) {
        queryClient.setQueryData(["parsedTask"], result.task);
        setInput("");
        toast({
          title: "Success",
          description: "Task parsed successfully",
        });
      } else {
        toast({
          title: "Parsing Error",
          description: result.error || "Failed to parse task",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Parsing Error",
        description: error || "Failed to parse task",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setInput("");
    queryClient.removeQueries({ queryKey: ["parsedTask"] });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Add New Task
        </h2>
        <p className="text-slate-600 text-sm">
          Type your task in natural language. Example: "Finish landing page by
          11pm 20th June"
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Enter your task in natural language..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="absolute bottom-3 right-3 text-slate-400 text-xs">
            {input.length}/500
          </div>
        </div>

        {/* 🔧 Responsive Action Row Fix */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <Wand2 className="w-4 h-4 text-primary" />
              <span>AI-powered parsing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-green-600" />
              <span>Smart date detection</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-3">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!input.trim()}
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
            <Button
              onClick={handleParse}
              disabled={!input.trim() || isLoading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>Parse + Add Task</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

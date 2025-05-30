import { TaskInput } from "@/components/task-input";
import { TaskStats } from "@/components/task-stats";
import { TaskFilters } from "@/components/task-filters";
import { TaskTable } from "@/components/task-table";
import { TaskEditModal } from "@/components/task-edit-modal";
import { ParsePreview } from "@/components/parse-preview";
import { useState } from "react";
import type { Task } from "@shared/schema";
import { Bell, Settings } from "lucide-react";

export default function TaskManager() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">TaskFlow</h1>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">Enterprise</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskInput />
        {/* <ParsePreview /> */}
        {/* <TaskStats /> */}
        <TaskFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
        <TaskTable
          searchQuery={searchQuery}
          assigneeFilter={assigneeFilter}
          priorityFilter={priorityFilter}
          onEditTask={setEditingTask}
        />
        
        {editingTask && (
          <TaskEditModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </main>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortAsc, Download } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { useMemo } from "react";

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
}

export function TaskFilters({
  searchQuery,
  setSearchQuery,
  assigneeFilter,
  setAssigneeFilter,
  priorityFilter,
  setPriorityFilter,
}: TaskFiltersProps) {
  const { tasks } = useTaskStore();
  
  // Extract unique assignee names from tasks
  const uniqueAssignees = useMemo(() => {
    const assignees = tasks.map(task => task.assignee);
    return [...new Set(assignees)].sort();
  }, [tasks]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 sm:gap-y-0">
    
    {/* 🔧 Responsive Input + Filters Group */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-y-3 w-full">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>

      <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {uniqueAssignees.map((assignee) => (
            <SelectItem key={assignee} value={assignee.toLowerCase()}>{assignee}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="P1">P1 - Critical</SelectItem>
          <SelectItem value="P2">P2 - High</SelectItem>
          <SelectItem value="P3">P3 - Medium</SelectItem>
          <SelectItem value="P4">P4 - Low</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center space-x-2 mt-3 sm:mt-0">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <SortAsc className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4" />
      </Button>
    </div>
    
  </div>
</div>

  );
}

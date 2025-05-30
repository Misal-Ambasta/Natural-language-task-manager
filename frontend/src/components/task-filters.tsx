import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortAsc, Download } from "lucide-react";

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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="aman">Aman</SelectItem>
              <SelectItem value="rajeev">Rajeev</SelectItem>
              <SelectItem value="priya">Priya</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
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
        
        <div className="flex items-center space-x-2">
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

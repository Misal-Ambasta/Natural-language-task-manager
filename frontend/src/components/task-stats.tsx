import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, AlertTriangle, ListTodo } from "lucide-react";

export function TaskStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/tasks/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Tasks",
      value: stats?.total || 0,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "In Progress",
      value: stats?.inProgress || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Overdue",
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => (
        <Card key={item.title} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">{item.title}</p>
                <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
              <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

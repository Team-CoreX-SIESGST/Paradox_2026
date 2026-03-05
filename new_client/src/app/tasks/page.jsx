'use client';

import { AppSidebar } from "@/components/SIdebar";

const columns = [
  {
    key: "pending",
    label: "Pending",
    tasks: [
      { id: 1, title: "Update KYC policy for digital lending", source: "RBI/2024-25/48", dept: "Compliance", due: "Mar 15", priority: "critical", assignee: "AK" },
      { id: 2, title: "Review third-party lending agreements", source: "RBI/2024-25/48", dept: "Legal", due: "Mar 8", priority: "critical", assignee: "PS" },
      { id: 3, title: "Submit NBFC disclosure report", source: "RBI/2024-25/55", dept: "Finance", due: "Mar 20", priority: "medium", assignee: "RG" },
    ],
  },
  {
    key: "in-progress",
    label: "In Progress",
    tasks: [
      { id: 4, title: "Implement cybersecurity protocols", source: "RBI/2024-25/52", dept: "IT Security", due: "Mar 10", priority: "critical", assignee: "VN" },
      { id: 5, title: "Update AML transaction monitoring", source: "RBI/2024-25/42", dept: "Compliance", due: "Mar 18", priority: "medium", assignee: "AK" },
    ],
  },
  {
    key: "completed",
    label: "Completed",
    tasks: [
      { id: 6, title: "Train staff on updated AML procedures", source: "RBI/2024-25/42", dept: "HR", due: "Feb 28", priority: "low", assignee: "SM" },
      { id: 7, title: "Deploy data localization infrastructure", source: "RBI/2024-25/48", dept: "IT", due: "Feb 25", priority: "medium", assignee: "VN" },
    ],
  },
];

function getPriorityBorder(priority) {
  if (priority === "critical") return " border-l-2 border-l-crail";
  if (priority === "medium") return " border-l-2 border-l-cloudy";
  return "";
}

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex">
      {/* Sidebar - fixed width */}
      <AppSidebar />
      
      {/* Main content - takes remaining width */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-sm text-cloudy mt-1">Track compliance tasks across your organization</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                <span className="bg-pampas rounded-full px-2 py-0.5 text-xs text-cloudy">
                     {col.tasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={
                      "bg-background border border-border-subtle rounded-xl p-4" +
                      getPriorityBorder(task.priority)
                    }
                  >
                    <p className="text-sm font-semibold text-foreground mb-2">{task.title}</p>
                    <p className="text-xs text-cloudy mb-3">
                      Source: <span className="text-crail">{task.source}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs rounded-full px-2 py-0.5 bg-pampas text-cloudy">
                          {task.dept}
                        </span>
                        <span className="text-xs text-cloudy">Due {task.due}</span>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-pampas border border-border-subtle flex items-center justify-center text-xs font-medium text-crail">
                        {task.assignee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
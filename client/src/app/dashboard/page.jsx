'use client';

import { FileText, CheckSquare, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "@/components/SIdebar";

const statsData = [
  { label: "New Circulars", value: "12", sub: "This month", icon: FileText },
  { label: "Open Tasks", value: "28", sub: "5 overdue", icon: CheckSquare },
  { label: "Compliance Score", value: "87%", sub: "+3% from last month", icon: TrendingUp },
  { label: "Upcoming Deadlines", value: "6", sub: "Next: Mar 15", icon: Clock },
];

const recentCirculars = [
  {
    id: 1,
    ref: "RBI/2024-25/48",
    date: "Feb 28, 2026",
    category: "Master Direction",
    title: "Updated Guidelines on Digital Lending by Commercial Banks",
    summary: "RBI has issued comprehensive updates to digital lending guidelines, mandating stricter KYC norms for digital lending platforms and enhanced consumer protection measures.",
  },
  {
    id: 2,
    ref: "RBI/2024-25/52",
    date: "Feb 25, 2026",
    category: "Circular",
    title: "Revised Framework for Cybersecurity in Banks",
    summary: "New cybersecurity framework requiring banks to implement advanced threat detection systems, mandatory penetration testing, and incident response protocols.",
  },
  {
    id: 3,
    ref: "RBI/2024-25/55",
    date: "Feb 22, 2026",
    category: "Notification",
    title: "NBFC Scale-Based Regulation: Updated Compliance Requirements",
    summary: "Scale-based regulatory framework for NBFCs has been updated with additional compliance requirements for upper-layer NBFCs including enhanced disclosure norms.",
  },
];

const tasks = [
  { id: 1, title: "Update KYC policy for digital lending", dept: "Compliance", due: "Mar 15", overdue: false },
  { id: 2, title: "Implement new cybersecurity protocols", dept: "IT Security", due: "Mar 10", overdue: true },
  { id: 3, title: "Submit NBFC disclosure report", dept: "Finance", due: "Mar 20", overdue: false },
  { id: 4, title: "Review third-party lending agreements", dept: "Legal", due: "Mar 8", overdue: true },
  { id: 5, title: "Train staff on updated AML procedures", dept: "HR", due: "Mar 25", overdue: false },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-cloudy mt-1">Your compliance overview at a glance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsData.map((s) => (
              <div key={s.label} className="bg-background border border-border-subtle rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-cloudy uppercase tracking-wide">{s.label}</p>
                  <s.icon className="h-4 w-4 text-cloudy" />
                </div>
                <p className="text-2xl font-semibold text-crail">{s.value}</p>
                <p className="text-xs text-cloudy mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Recent Circulars */}
            <div className="flex-1 lg:w-[60%]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent RBI Updates</h2>
                <Link
                  href="/circulars"
                  className="flex items-center gap-1 text-xs text-cloudy hover:text-foreground font-medium transition-colors duration-150"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentCirculars.map((c) => (
                  <div key={c.id} className="bg-background border border-border-subtle rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-cloudy">{c.ref}</span>
                      <span className="text-xs text-cloudy">{c.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-pampas text-crail font-medium border border-crail/20">
                        {c.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-cloudy mt-1 line-clamp-2">{c.summary}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <Link
                        href="/circulars"
                        className="text-xs text-crail font-medium hover:text-[#A8502F] transition-colors duration-150"
                      >
                        View Details
                      </Link>
                      <button className="text-xs text-cloudy hover:text-foreground font-medium transition-colors duration-150">
                        Generate Tasks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="lg:w-[40%]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Pending Tasks</h2>
                <Link
                  href="/tasks"
                  className="flex items-center gap-1 text-xs text-cloudy hover:text-foreground font-medium transition-colors duration-150"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className={
                      "bg-background border border-border-subtle rounded-xl p-3 flex items-start gap-3 " +
                      (t.overdue ? "border-l-2 border-l-crail" : "")
                    }
                  >
                    <input type="checkbox" className="mt-1 accent-crail h-4 w-4 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs rounded-full px-2 py-0.5 bg-pampas text-cloudy">
                          {t.dept}
                        </span>
                        <span className={"text-xs " + (t.overdue ? "text-crail font-medium" : "text-cloudy")}>
                          Due {t.due}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
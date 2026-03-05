'use client';

import { useState } from "react";
import { Search, X } from "lucide-react";
import { AppSidebar } from "@/components/SIdebar";

const filters = ["All", "Circulars", "Master Directions", "Press Releases", "Notifications"];

const circularsData = [
  {
    id: 1, ref: "RBI/2024-25/48", date: "Feb 28, 2026", category: "Master Direction",
    title: "Updated Guidelines on Digital Lending by Commercial Banks",
    summary: "Comprehensive updates to digital lending guidelines mandating stricter KYC norms, enhanced consumer protection, and data localization requirements for digital lending platforms.",
    obligations: 8,
  },
  {
    id: 2, ref: "RBI/2024-25/52", date: "Feb 25, 2026", category: "Circular",
    title: "Revised Framework for Cybersecurity in Banks",
    summary: "New cybersecurity framework requiring banks to implement advanced threat detection, mandatory penetration testing, and incident response protocols within 90 days.",
    obligations: 12,
  },
  {
    id: 3, ref: "RBI/2024-25/55", date: "Feb 22, 2026", category: "Notification",
    title: "NBFC Scale-Based Regulation: Updated Compliance Requirements",
    summary: "Enhanced compliance requirements for upper-layer NBFCs including new disclosure norms, capital adequacy updates, and governance structure mandates.",
    obligations: 6,
  },
  {
    id: 4, ref: "RBI/2024-25/42", date: "Feb 18, 2026", category: "Circular",
    title: "Anti-Money Laundering Standards for Payment Aggregators",
    summary: "Updated AML/CFT standards specifically for payment aggregators and payment gateways, including enhanced due diligence for high-value transactions.",
    obligations: 10,
  },
  {
    id: 5, ref: "RBI/2024-25/39", date: "Feb 14, 2026", category: "Master Direction",
    title: "Priority Sector Lending - Revised Targets and Classification",
    summary: "Revised PSL targets with updated classification criteria for agricultural loans, micro-enterprises, and affordable housing lending.",
    obligations: 5,
  },
  {
    id: 6, ref: "RBI/2024-25/36", date: "Feb 10, 2026", category: "Press Release",
    title: "Monetary Policy Statement - February 2026",
    summary: "Key highlights from the RBI's bi-monthly monetary policy review including repo rate decisions, liquidity measures, and economic outlook.",
    obligations: 3,
  },
];

function CircularDrawer({ circular, onClose }) {
  const [tab, setTab] = useState("summary");
  if (!circular) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/10" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border-l border-border-subtle h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs px-2 py-0.5 rounded bg-pampas text-crail font-medium border border-crail/20">
              {circular.category}
            </span>
            <button
              onClick={onClose}
              className="text-cloudy hover:text-foreground transition-colors duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs font-mono text-cloudy mb-1">
            {circular.ref} · {circular.date}
          </p>
          <h2 className="text-lg font-semibold text-foreground mb-6">{circular.title}</h2>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border-subtle">
            {["summary", "obligations", "tasks"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "px-4 py-2 text-xs font-medium capitalize transition-colors duration-150 border-b-2 " +
                  (tab === t
                    ? "border-crail text-crail"
                    : "border-transparent text-cloudy hover:text-foreground")
                }
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "summary" && (
            <p className="text-sm text-foreground leading-relaxed">{circular.summary}</p>
          )}

          {tab === "obligations" && (
            <div className="space-y-3">
              {Array.from({ length: circular.obligations }, (_, i) => (
                <div key={i} className="flex gap-3 p-3 border border-border-subtle rounded-lg">
                  <span className="text-xs font-semibold text-crail mt-0.5">{i + 1}.</span>
                  <div>
                    <p className="text-sm text-foreground">
                      Obligation item {i + 1} extracted from circular
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs rounded-full px-2 py-0.5 bg-pampas text-cloudy">
                        Compliance
                      </span>
                      <span className="text-xs text-cloudy">Due in 30 days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-border-subtle rounded-lg">
                  <input type="checkbox" className="mt-1 accent-crail h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Task {i + 1} from this circular</p>
                    <p className="text-xs text-cloudy mt-0.5">Assigned to Compliance Team</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CircularsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCircular, setSelectedCircular] = useState(null);

  const filtered = circularsData.filter((c) => {
    const matchFilter =
      activeFilter === "All" || c.category === activeFilter.replace(/s$/, "");
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">RBI Circulars</h1>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cloudy" />
              <input
                type="text"
                placeholder="Search circulars..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-pampas border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-cloudy focus:outline-none focus:ring-1 focus:ring-crail"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-150 " +
                  (activeFilter === f
                    ? "bg-crail text-white"
                    : "bg-background border border-border-subtle text-cloudy hover:text-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <div key={c.id} className="bg-background border border-border-subtle rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-cloudy">{c.ref}</span>
                  <span className="text-xs text-cloudy">{c.date}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-pampas text-crail font-medium border border-crail/20">
                    {c.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                <p className="text-sm text-cloudy mt-2 line-clamp-3">{c.summary}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-cloudy">{c.obligations} obligations extracted</span>
                  <button
                    onClick={() => setSelectedCircular(c)}
                    className="text-xs text-crail hover:text-[#A8502F] font-medium transition-colors duration-150"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <CircularDrawer circular={selectedCircular} onClose={() => setSelectedCircular(null)} />
    </div>
  );
}
'use client';

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AppSidebar } from "@/components/SIdebar";

const ITEMS_PER_PAGE = 8;

function toFilterLabel(category) {
  if (!category) return "Circulars";
  if (category.endsWith("s")) return category;
  return `${category}s`;
}

function CircularDrawer({ circular, onClose }) {
  const [tab, setTab] = useState("summary");

  useEffect(() => {
    setTab("summary");
  }, [circular?.id]);

  if (!circular) return null;

  const taskItems = circular.obligationItems?.slice(0, 3) ?? [];

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
          <h2 className="text-lg font-semibold text-foreground mb-2">{circular.title}</h2>
          <p className="text-xs text-cloudy mb-6">
            Topic: {circular.topic} · Status: {circular.status}
          </p>

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
              {circular.obligationItems?.length ? (
                circular.obligationItems.map((item, i) => (
                  <div key={item.id} className="flex gap-3 p-3 border border-border-subtle rounded-lg">
                    <span className="text-xs font-semibold text-crail mt-0.5">{i + 1}.</span>
                    <div>
                      <p className="text-sm text-foreground">{item.text}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs rounded-full px-2 py-0.5 bg-pampas text-cloudy">
                          {item.frequency}
                        </span>
                        <span className="text-xs text-cloudy">Source: {item.sourceClause}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-cloudy">No obligations extracted for this circular.</p>
              )}
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-2">
              {(taskItems.length ? taskItems : [{ id: "na", text: "No tasks available for this circular." }]).map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border border-border-subtle rounded-lg">
                  <input
                    type="checkbox"
                    className="mt-1 accent-crail h-4 w-4"
                    disabled={taskItems.length === 0}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {taskItems.length ? `Task ${i + 1}: ${item.text}` : item.text}
                    </p>
                    {taskItems.length ? (
                      <p className="text-xs text-cloudy mt-0.5">Derived from obligations</p>
                    ) : null}
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

export default function CircularsClient({ circulars }) {
  const [circularsData, setCircularsData] = useState(Array.isArray(circulars) ? circulars : []);
  const [isLoading, setIsLoading] = useState(!Array.isArray(circulars));
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadCirculars = async () => {
      if (Array.isArray(circulars)) {
        setCircularsData(circulars);
        setIsLoading(false);
        setLoadError("");
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/circulars");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch circulars");
        }

        if (!isMounted) return;
        setCircularsData(Array.isArray(data?.circulars) ? data.circulars : []);
      } catch (error) {
        if (!isMounted) return;
        setCircularsData([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load circulars.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCirculars();

    return () => {
      isMounted = false;
    };
  }, [circulars]);

  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set((circularsData || []).map((c) => c.category)));
    return [{ label: "All", value: "All" }, ...categories.map((category) => ({
      label: toFilterLabel(category),
      value: category,
    }))];
  }, [circularsData]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (circularsData || []).filter((circular) => {
      const matchFilter = activeFilter === "All" || circular.category === activeFilter;
      const matchSearch =
        !query ||
        circular.title.toLowerCase().includes(query) ||
        circular.summary.toLowerCase().includes(query) ||
        circular.ref.toLowerCase().includes(query) ||
        circular.topic.toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });
  }, [activeFilter, search, circularsData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleCirculars = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />

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

          <div className="flex flex-wrap gap-2 mb-6">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-150 " +
                  (activeFilter === filter.value
                    ? "bg-crail text-white"
                    : "bg-background border border-border-subtle text-cloudy hover:text-foreground")
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border-subtle p-8 text-center text-cloudy">
              Loading circulars...
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-border-subtle p-8 text-center text-cloudy">
              {loadError}
            </div>
          ) : visibleCirculars.length === 0 ? (
            <div className="rounded-xl border border-border-subtle p-8 text-center text-cloudy">
              No circulars found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleCirculars.map((circular) => (
                <div key={circular.id} className="bg-background border border-border-subtle rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-cloudy">{circular.ref}</span>
                    <span className="text-xs text-cloudy">{circular.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-pampas text-crail font-medium border border-crail/20">
                      {circular.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{circular.title}</h3>
                  <p className="text-sm text-cloudy mt-2 line-clamp-3">{circular.summary}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-cloudy">{circular.obligations} obligations extracted</span>
                    <button
                      onClick={() => setSelectedCircular(circular)}
                      className="text-xs text-crail hover:text-[#A8502F] font-medium transition-colors duration-150"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border-subtle px-3 py-1.5 text-xs text-foreground disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2 text-xs text-cloudy">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border-subtle px-3 py-1.5 text-xs text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </main>

      <CircularDrawer circular={selectedCircular} onClose={() => setSelectedCircular(null)} />
    </div>
  );
}

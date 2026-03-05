'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { AppSidebar } from '@/components/SIdebar';
import { useAuth } from '@/contexts/auth-context';
import { SERVER_URL } from '@/utils/commonHelper';

const COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

function getPriorityBorder(priority) {
  if (priority === 'critical') return ' border-l-2 border-l-crail';
  if (priority === 'medium') return ' border-l-2 border-l-cloudy';
  return '';
}

function getNextStatus(currentStatus) {
  if (currentStatus === 'pending') return 'in_progress';
  if (currentStatus === 'in_progress') return 'completed';
  return 'pending';
}

function getStatusActionLabel(currentStatus) {
  if (currentStatus === 'pending') return 'Start';
  if (currentStatus === 'in_progress') return 'Complete';
  return 'Reopen';
}

function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date';
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) return 'No due date';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getUserInitials(user) {
  const raw = user?.username || user?.name || user?.email || 'U';
  return String(raw)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function TasksPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [error, setError] = useState('');
  const userInitials = getUserInitials(user);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  const fetchTasks = useCallback(async () => {
    if (!token) {
      setTasks([]);
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [tasksRes, statsRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/tasks`, { headers: authHeaders }),
        fetch(`${SERVER_URL}/api/tasks/stats`, { headers: authHeaders }),
      ]);

      const tasksJson = await tasksRes.json();
      const statsJson = await statsRes.json();

      if (!tasksRes.ok) {
        throw new Error(tasksJson?.error || 'Failed to fetch tasks');
      }
      if (!statsRes.ok) {
        throw new Error(statsJson?.error || 'Failed to fetch task stats');
      }

      setTasks(tasksJson?.data?.tasks || []);
      setStats(statsJson?.data || null);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    if (authLoading) return;
    fetchTasks();
  }, [authLoading, fetchTasks]);

  const handleStatusUpdate = useCallback(
    async (task) => {
      if (!token) return;
      const nextStatus = getNextStatus(task.status);

      setUpdatingTaskId(task.id);
      setError('');
      try {
        const response = await fetch(`${SERVER_URL}/api/tasks/${task.id}/status`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ status: nextStatus }),
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || 'Failed to update task status');
        }
        await fetchTasks();
      } catch (updateError) {
        setError(updateError.message || 'Failed to update task status');
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [authHeaders, fetchTasks, token],
  );

  const handleRunUpdateScan = useCallback(async () => {
    if (!token) return;
    setSyncing(true);
    setError('');
    try {
      const response = await fetch(`${SERVER_URL}/api/tasks/generate-from-updates`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ force: false }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to run RBI update scan');
      }
      await fetchTasks();
    } catch (scanError) {
      setError(scanError.message || 'Failed to run RBI update scan');
    } finally {
      setSyncing(false);
    }
  }, [authHeaders, fetchTasks, token]);

  const groupedTasks = useMemo(() => {
    const grouped = {
      pending: [],
      in_progress: [],
      completed: [],
    };

    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped.pending.push(task);
      }
    }
    return grouped;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex">
      <AppSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
            <p className="text-sm text-cloudy mt-1">Track compliance tasks generated from RBI updates</p>
            {stats && (
              <p className="text-xs text-cloudy mt-2">
                Total: {stats.total} | Pending: {stats.pending} | In Progress: {stats.in_progress} | Completed: {stats.completed}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchTasks}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs text-cloudy hover:text-foreground"
              type="button"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleRunUpdateScan}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg border border-crail/30 bg-pampas px-3 py-2 text-xs text-crail hover:bg-crail/10"
              type="button"
            >
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Run RBI Update Check
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-crail/30 bg-crail/5 px-3 py-2 text-xs text-crail">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-cloudy">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading tasks...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COLUMNS.map((col) => (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                  <span className="bg-pampas rounded-full px-2 py-0.5 text-xs text-cloudy">
                    {groupedTasks[col.key]?.length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {(groupedTasks[col.key] || []).map((task) => (
                    <div
                      key={task.id}
                      className={
                        'bg-background border border-border-subtle rounded-xl p-4' +
                        getPriorityBorder(task.priority)
                      }
                    >
                      <p className="text-sm font-semibold text-foreground mb-2">{task.title}</p>
                      <p className="text-xs text-cloudy mb-3">
                        Source: <span className="text-crail">{task.source_circular_ref || task.source_rule_key || 'Manual'}</span>
                      </p>
                      <p className="text-xs text-cloudy mb-3 line-clamp-3">{task.description || 'No description'}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs rounded-full px-2 py-0.5 bg-pampas text-cloudy">
                            {task.department || 'Compliance'}
                          </span>
                          <span className="text-xs text-cloudy">Due {formatDueDate(task.due_date)}</span>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-pampas border border-border-subtle flex items-center justify-center text-xs font-medium text-crail">
                          {userInitials}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(task)}
                        disabled={updatingTaskId === task.id}
                        className="w-full rounded-md border border-border-subtle px-3 py-1.5 text-xs text-cloudy hover:text-foreground"
                      >
                        {updatingTaskId === task.id ? 'Updating...' : getStatusActionLabel(task.status)}
                      </button>
                    </div>
                  ))}

                  {(groupedTasks[col.key] || []).length === 0 && (
                    <div className="rounded-xl border border-dashed border-border-subtle p-4 text-xs text-cloudy">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

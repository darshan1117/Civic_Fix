'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Issue } from '@/lib/types';
import { IssuesTable } from '@/components/admin/IssuesTable';
import { Briefcase, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export default function OfficerQueuePage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If officer, filter by their department_id; if admin, show all
    const deptParam = user?.department_id ? `&department_id=${user.department_id}` : '';
    fetch(`/api/issues?sortBy=priority&sortOrder=desc${deptParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeIssues = issues.filter(
    (i) => i.status !== 'Closed' && i.status !== 'Rejected'
  );
  const overdueCount = activeIssues.filter(
    (i) => new Date(i.sla_deadline).getTime() < Date.now()
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Department Operations Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assigned to: <strong className="text-slate-800 dark:text-slate-200">{user?.full_name}</strong>{' '}
            (Sorted automatically by dynamic priority score)
          </p>
        </div>

        {/* Overdue alert indicator */}
        {overdueCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>{overdueCount} Critical Overdue SLA Breaches</span>
          </div>
        )}
      </div>

      {/* Main Priority Queue Table */}
      <IssuesTable
        issues={issues}
        title="Priority Work Order Queue"
        isOfficerQueue={true}
      />
    </div>
  );
}

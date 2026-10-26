'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Issue } from '@/lib/types';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { SLACountdownBadge } from '@/components/issues/SLACountdownBadge';
import Link from 'next/link';
import {
  ListTodo,
  ExternalLink,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/issues?reporter_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const filtered = issues.filter((issue) => {
    if (activeTab === 'open') return issue.status === 'Submitted' || issue.status === 'Acknowledged';
    if (activeTab === 'in_progress') return issue.status === 'In Progress' || issue.status === 'Reopened';
    if (activeTab === 'resolved') return issue.status === 'Resolved';
    if (activeTab === 'closed') return issue.status === 'Closed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            My Reported Issues
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track resolution progress, confirm completed fixes, or file disputes.
          </p>
        </div>

        <Link
          href="/report"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Report New Hazard
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({issues.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
            activeTab === 'open'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Open ({issues.filter((i) => i.status === 'Submitted' || i.status === 'Acknowledged').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
            activeTab === 'in_progress'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          In Progress ({issues.filter((i) => i.status === 'In Progress' || i.status === 'Reopened').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
            activeTab === 'resolved'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Needs Confirmation ({issues.filter((i) => i.status === 'Resolved').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('closed')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
            activeTab === 'closed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Closed ({issues.filter((i) => i.status === 'Closed').length})
        </button>
      </div>

      {/* Issues List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <ListTodo className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
            No issues found in this category
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you report potholes, garbage dumps, or broken streetlights, they will show up here.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100"
          >
            <PlusCircle className="w-4 h-4" /> Report an issue now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {issue.photos && issue.photos.length > 0 && (
                  <img
                    src={issue.photos[0].url}
                    alt={issue.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {issue.public_id}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {issue.category_name}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {issue.address_text}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <SLACountdownBadge
                  createdAt={issue.created_at}
                  slaDeadline={issue.sla_deadline}
                  isCompleted={issue.status === 'Resolved' || issue.status === 'Closed'}
                />

                <Link
                  href={`/issues/${issue.id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

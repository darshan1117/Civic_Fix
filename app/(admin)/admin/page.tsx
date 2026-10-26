'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { StatCards } from '@/components/admin/StatCards';
import { IssuesChart } from '@/components/admin/IssuesChart';
import { HotspotMap } from '@/components/map/HotspotMap';
import { Issue } from '@/lib/types';
import Link from 'next/link';
import {
  BarChart3,
  Flame,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Layers,
  ArrowRight,
  Shield,
  Settings,
  Users,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isRunningEscalation, setIsRunningEscalation] = useState(false);
  const [escalationFeedback, setEscalationFeedback] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, issuesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/issues'),
      ]);
      const statsData = await statsRes.json();
      const issuesData = await issuesRes.json();

      setStats(statsData);
      if (Array.isArray(issuesData)) setIssues(issuesData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Admin Manual "Run SLA Escalation check now"
  const handleTriggerEscalation = async () => {
    setIsRunningEscalation(true);
    setEscalationFeedback(null);
    try {
      const res = await fetch('/api/cron/escalate', {
        method: 'POST',
      });
      const data = await res.json();
      setEscalationFeedback(data);
      await fetchDashboardData();
    } catch (err: any) {
      setEscalationFeedback({ error: err.message || 'Escalation job failed' });
    } finally {
      setIsRunningEscalation(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Loading City Command Center analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              City Administration Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time municipal performance, department workloads, and SLA compliance monitoring.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleTriggerEscalation}
            disabled={isRunningEscalation}
            title="Trigger immediate check for issues that passed SLA deadline"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            {isRunningEscalation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            Run SLA Escalation Check Now
          </button>

          <Link
            href="/admin/sla-rules"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" /> SLA Rules
          </Link>

          <Link
            href="/admin/hotspots"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Hotspots Map
          </Link>
        </div>
      </div>

      {/* Escalation Feedback Notification Banner */}
      {escalationFeedback && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              SLA check completed ({escalationFeedback.mode}):{' '}
              <strong>{escalationFeedback.escalatedCount} issue(s) escalated</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEscalationFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <StatCards stats={stats} />

      {/* Recharts Graphs */}
      <IssuesChart
        departmentStats={stats.departmentStats || []}
        categoryStats={stats.categoryStats || []}
      />

      {/* Hotspots Density Map Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Civic Hazard Hotspot Density Map
            </h3>
            <p className="text-xs text-slate-500">
              High-density clusters identifying neglected areas across Bengaluru municipal wards.
            </p>
          </div>
          <Link
            href="/admin/hotspots"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Fullscreen Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <HotspotMap issues={issues} height="420px" />
      </div>

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
        <Link
          href="/admin/issues"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Master Issues Directory
            </div>
            <div className="text-slate-400">Search, filter & export civic work orders</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/admin/sla-rules"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              SLA Rules & Timers
            </div>
            <div className="text-slate-400">Configure resolution windows per category</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/admin/officers"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Department Officers Roster
            </div>
            <div className="text-slate-400">Manage agency heads & crew officers</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}

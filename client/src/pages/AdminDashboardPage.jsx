import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  MapPin,
  Flame,
  TrendingUp,
  Building,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const CATEGORY_COLORS = ['#2563eb', '#16a34a', '#eab308', '#0891b2', '#9333ea', '#64748b'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [escalationResult, setEscalationResult] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunEscalation = async () => {
    setEscalating(true);
    setEscalationResult(null);
    try {
      const res = await api.post('/cron/escalate');
      setEscalationResult(res.data);
      fetchStats();
    } catch (err) {
      setEscalationResult({
        success: false,
        message: err.response?.data?.error || 'Escalation check failed.',
      });
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Aggregating municipal analytics...</p>
      </div>
    );
  }

  const departmentData = (stats?.departmentStats || []).map((d) => ({
    name: d.name.replace('Department of ', '').replace('BBMP ', ''),
    Open: d.open,
    Resolved: d.resolved,
  }));

  const categoryData = (stats?.categoryStats || []).map((c) => ({
    name: c.name,
    value: c.count,
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <BarChart3 className="w-4 h-4" /> Executive Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Municipal Operations & Analytics
            </h1>
            <p className="text-sm text-slate-600">
              City-wide issue tracking, SLA compliance metrics, and automated escalation controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunEscalation}
              disabled={escalating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${escalating ? 'animate-spin' : ''}`} />
              Run SLA Escalation Check Now
            </button>
            <Link
              to="/admin/sla"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs"
            >
              <Settings className="w-4 h-4 text-slate-500" /> SLA Rules
            </Link>
            <Link
              to="/admin/hotspots"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs"
            >
              <MapPin className="w-4 h-4 text-blue-600" /> Hotspots Map
            </Link>
          </div>
        </div>

        {/* Escalation Feedback Banner */}
        {escalationResult && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-start justify-between animate-in fade-in ${
              escalationResult.success
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="space-y-1">
              <p className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Automated Escalation Sweep Result
              </p>
              <p className="text-xs">
                {escalationResult.message ||
                  `Evaluated issues: ${escalationResult.checkedCount || 0}. Escalated: ${escalationResult.escalatedCount || 0} issues past SLA deadline.`}
              </p>
            </div>
            <button
              onClick={() => setEscalationResult(null)}
              className="text-xs font-semibold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Total Reports</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalIssues || 0}</p>
            <span className="text-[11px] text-slate-400">All-time logged</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Active Open</span>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.openIssuesCount || 0}</p>
            <span className="text-[11px] text-blue-500 font-medium">In workflow</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Resolved / Closed</span>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{stats?.resolvedIssuesCount || 0}</p>
            <span className="text-[11px] text-emerald-500 font-medium">Repairs completed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">SLA Compliance</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.slaComplianceRate || 92}%</p>
            <span className="text-[11px] text-emerald-600 font-medium">Within target SLA</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Avg Resolution</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.avgResolutionHours || 24}h</p>
            <span className="text-[11px] text-slate-400">Mean time to fix</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500">Breached / Escalated</span>
            <p className="text-2xl font-bold text-rose-600 mt-2">{stats?.escalatedCount || 0}</p>
            <span className="text-[11px] text-rose-500 font-medium">Tier 1 & 2 alerts</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workload by Department</h3>
                <p className="text-xs text-slate-500">Comparison of open vs resolved cases</p>
              </div>
              <Building className="w-5 h-5 text-slate-400" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Open" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reports by Category</h3>
                <p className="text-xs text-slate-500">Proportion of civic defect classifications</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Links Footer Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Automated SLA Escalation Cron Job</h3>
            <p className="text-xs text-blue-200 max-w-xl">
              Configured endpoint at <code className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">/api/cron/escalate</code>.
              In production, this route is triggered every 15 minutes by GitHub Actions or an external cron scheduler.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunEscalation}
              disabled={escalating}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-sm"
            >
              Trigger Sweep
            </button>
            <Link
              to="/officer/queue"
              className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-600 transition"
            >
              Open Dispatch Queue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

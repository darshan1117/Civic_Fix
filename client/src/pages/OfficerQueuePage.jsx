import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { SLABadge } from '../components/SLABadge';
import { ProofOfFixModal } from '../components/ProofOfFixModal';
import api from '../services/api';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function OfficerQueuePage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDept, setSelectedDept] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [resolvingIssue, setResolvingIssue] = useState(null);

  const fetchQueueData = async () => {
    try {
      const [deptRes, issueRes] = await Promise.all([
        api.get('/departments'),
        api.get('/issues'),
      ]);
      setDepartments(deptRes.data || []);
      setIssues(issueRes.data || []);
    } catch (err) {
      console.error('Failed to load queue data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQueueData();
  };

  const handleQuickStatus = async (issueId, targetStatus, note = '', proofPhotoUrl = '') => {
    try {
      await api.patch(`/issues/${issueId}/status`, {
        status: targetStatus,
        note,
        proofPhotoUrl,
      });
      fetchQueueData();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (selectedDept !== 'all') {
      const deptId = issue.department?._id || issue.department;
      if (String(deptId) !== String(selectedDept)) return false;
    }

    if (statusFilter === 'active') {
      if (['Resolved', 'Closed', 'Rejected'].includes(issue.status)) return false;
    } else if (statusFilter !== 'all') {
      if (issue.status !== statusFilter) return false;
    }

    if (overdueOnly) {
      const isPast = new Date(issue.sla_deadline).getTime() < Date.now();
      const isNotDone = !['Resolved', 'Closed', 'Rejected'].includes(issue.status);
      if (!isPast || !isNotDone) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        issue.title?.toLowerCase().includes(q) ||
        issue.public_id?.toLowerCase().includes(q) ||
        issue.address_text?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'priority') {
      return (b.priority_score || 0) - (a.priority_score || 0);
    }
    if (sortBy === 'sla_deadline') {
      return new Date(a.sla_deadline) - new Date(b.sla_deadline);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const overdueCount = issues.filter(
    (i) =>
      !['Resolved', 'Closed', 'Rejected'].includes(i.status) &&
      new Date(i.sla_deadline).getTime() < Date.now()
  ).length;

  const urgentCount = issues.filter(
    (i) => (i.priority_score || 0) >= 15 && !['Resolved', 'Closed'].includes(i.status)
  ).length;

  return (
    <div className={`min-h-screen py-8 transition-colors ${
      isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              <Briefcase className="w-4 h-4" /> Operational Command Center
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Department Officer Dispatch Queue
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage field reports routed to municipal departments with real-time SLA countdowns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border shadow-2xs transition cursor-pointer ${
                isDark
                  ? 'bg-[#131B2B] border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
            <Link
              to="/admin/hotspots"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              View Hotspots Map
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border shadow-2xs flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Open Workload</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {issues.filter((i) => !['Resolved', 'Closed', 'Rejected'].includes(i.status)).length}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-blue-950/60 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`p-5 rounded-2xl border cursor-pointer transition shadow-2xs flex items-center justify-between ${
              overdueOnly
                ? isDark
                  ? 'bg-rose-950/40 border-rose-700 ring-2 ring-rose-500'
                  : 'bg-rose-50 border-rose-300 ring-2 ring-rose-500'
                : isDark
                  ? 'bg-[#131B2B]/90 border-slate-800 hover:border-rose-800/80'
                  : 'bg-white border-slate-200 hover:border-rose-200'
            }`}
          >
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Breached SLA (Overdue)</p>
              <p className="text-2xl font-bold text-rose-500 mt-1">{overdueCount}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-50 text-rose-600'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-2xs flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Urgent High-Priority</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{urgentCount}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs space-y-4 transition-colors ${
          isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID (CF-...), problem title, or street..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="w-full md:w-56">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-medium transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-medium transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="priority">Sort: Highest Priority</option>
                <option value="sla_deadline">Sort: SLA Urgent First</option>
                <option value="createdAt">Sort: Most Recent</option>
              </select>
            </div>
          </div>

          <div className={`flex flex-wrap items-center gap-2 pt-2 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            {[
              { id: 'active', label: 'Active Open' },
              { id: 'all', label: 'All Statuses' },
              { id: 'Submitted', label: 'Submitted' },
              { id: 'Acknowledged', label: 'Acknowledged' },
              { id: 'In Progress', label: 'In Progress' },
              { id: 'Reopened', label: 'Reopened' },
              { id: 'Resolved', label: 'Resolved' },
              { id: 'Closed', label: 'Closed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <label className={`ml-auto flex items-center gap-2 cursor-pointer select-none text-xs font-medium px-3 py-1.5 rounded-lg border ${
              isDark
                ? 'text-rose-300 bg-rose-950/40 border-rose-800/60'
                : 'text-rose-700 bg-rose-50 border-rose-200'
            }`}>
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              Show Breached SLA Only
            </label>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading municipal dispatch queue...</p>
          </div>
        ) : sortedIssues.length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center space-y-3 transition-colors ${
            isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No issues found matching criteria</h3>
            <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              All tasks in this filter have been attended to or no reports exist yet.
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden shadow-2xs divide-y transition-colors ${
            isDark
              ? 'bg-[#131B2B]/90 border-slate-800 divide-slate-800'
              : 'bg-white border-slate-200 divide-slate-100'
          }`}>
            {sortedIssues.map((issue) => {
              const isOverdue =
                !['Resolved', 'Closed', 'Rejected'].includes(issue.status) &&
                new Date(issue.sla_deadline).getTime() < Date.now();
              const isResolvedOrClosed = ['Resolved', 'Closed', 'Rejected'].includes(issue.status);

              return (
                <div
                  key={issue._id}
                  className={`p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isDark
                      ? isOverdue ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/40'
                      : isOverdue ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        isDark ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {issue.public_id}
                      </span>
                      <StatusBadge status={issue.status} size="sm" />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        isDark ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {issue.category?.name || 'Category'}
                      </span>
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Dept: {issue.department?.name}
                      </span>
                      {issue.escalation_level > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isDark ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Escalated L{issue.escalation_level}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/issues/${issue.public_id || issue._id}`}
                      className={`text-base font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isDark ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'
                      }`}
                    >
                      {issue.title}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>

                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {issue.address_text || `${issue.lat}, ${issue.lng}`} • Reporter: {issue.reporter?.name || 'Citizen'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Priority</div>
                        <div className={`text-xs font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {issue.priority_score?.toFixed(1) || '0.0'} pts
                        </div>
                      </div>

                      <div className="min-w-32">
                        <SLABadge
                          createdAt={issue.createdAt}
                          slaDeadline={issue.sla_deadline}
                          isCompleted={isResolvedOrClosed}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {issue.status === 'Submitted' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(issue._id, 'Acknowledged', 'Department confirmed report and initiated assignment.')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-2xs cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      {issue.status === 'Acknowledged' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(issue._id, 'In Progress', 'Field crew deployed to location.')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 shadow-2xs cursor-pointer"
                        >
                          Deploy Crew
                        </button>
                      )}

                      {issue.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => setResolvingIssue(issue)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-2xs cursor-pointer"
                        >
                          Resolve...
                        </button>
                      )}

                      {issue.status === 'Reopened' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatus(issue._id, 'In Progress', 'Resumed crew deployment after citizen dispute.')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-2xs cursor-pointer"
                        >
                          Re-dispatch
                        </button>
                      )}

                      <Link
                        to={`/issues/${issue.public_id || issue._id}`}
                        className={`p-2 rounded-lg border transition cursor-pointer ${
                          isDark
                            ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="View Full Detail"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {resolvingIssue && (
        <ProofOfFixModal
          isOpen={!!resolvingIssue}
          onClose={() => setResolvingIssue(null)}
          onSubmit={async (photoUrl, note) => {
            await handleQuickStatus(resolvingIssue._id, 'Resolved', note, photoUrl);
            setResolvingIssue(null);
          }}
          issueTitle={resolvingIssue.title}
        />
      )}
    </div>
  );
}

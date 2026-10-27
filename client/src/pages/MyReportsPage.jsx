import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { SLABadge } from '../components/SLABadge';
import api from '../services/api';
import {
  FileText,
  PlusCircle,
  Clock,
  ChevronRight,
  Loader2,
  Calendar,
  Building,
} from 'lucide-react';

export default function MyReportsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    // Fetch issues reported by user
    api.get(`/issues?reporter=${user._id || user.id}`)
      .then((res) => {
        setIssues(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className={`min-h-screen py-8 transition-colors ${
      isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">
              <FileText className="w-4 h-4" /> Citizen Activity Dashboard
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              My Submitted Issues
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Track real-time resolution status and verify repair work completed by municipal crews.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Report New Issue
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading your civic reports...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center space-y-4 transition-colors ${
            isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              isDark ? 'bg-blue-950/60 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <FileText className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No issues reported yet</h3>
            <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Notice a pothole, uncollected garbage, or broken streetlight? Report it with a GPS pin and photo to start tracking resolution.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Submit Your First Report
            </Link>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden shadow-2xs divide-y transition-colors ${
            isDark
              ? 'bg-[#131B2B]/90 border-slate-800 divide-slate-800'
              : 'bg-white border-slate-200 divide-slate-100'
          }`}>
            {issues.map((issue) => {
              const isResolved = ['Resolved', 'Closed'].includes(issue.status);

              return (
                <Link
                  key={issue._id}
                  to={`/issues/${issue.public_id || issue._id}`}
                  className={`p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 block group cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1.5 max-w-xl">
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
                    </div>

                    <h3 className={`text-base font-bold transition ${
                      isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                    }`}>
                      {issue.title}
                    </h3>

                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {issue.address_text || `${issue.lat}, ${issue.lng}`}
                    </p>

                    <div className={`flex items-center gap-3 text-xs pt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-blue-500" /> {issue.department?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end">
                    <SLABadge
                      createdAt={issue.createdAt}
                      slaDeadline={issue.sla_deadline}
                      isCompleted={isResolved}
                    />
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

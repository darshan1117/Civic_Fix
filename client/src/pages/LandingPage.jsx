import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import api from '../services/api';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Briefcase,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 25,
    resolvedIssuesCount: 16,
    avgResolutionHours: 28,
    slaComplianceRate: 91,
  });

  useEffect(() => {
    api.get('/issues').then((res) => {
      if (Array.isArray(res.data)) setIssues(res.data);
    }).catch(() => {});

    api.get('/stats').then((res) => {
      if (res.data?.totalIssues) setStats(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Next-Gen MERN Civic Infrastructure</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                Report it. Track it.{' '}
                <span className="text-blue-600">Get it fixed.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The smart civic resolution platform for cities. Report potholes, garbage dumps,
                and water leaks in 30 seconds with <strong>50m spatial duplicate detection</strong>,
                department auto-routing, and statutory <strong>SLA countdowns</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/report"
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm inline-flex items-center justify-center gap-2"
                >
                  Report an Issue <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/issues"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-xl shadow-xs transition-colors text-sm inline-flex items-center justify-center gap-2"
                >
                  Explore Public Map
                </Link>

                <Link
                  to="/officer/queue"
                  className="w-full sm:w-auto px-5 py-3.5 text-slate-600 hover:text-blue-600 text-sm font-medium inline-flex items-center justify-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4 text-slate-400" /> Officer Portal
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>MongoDB 2dsphere proximity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mandatory photo proof of fix</span>
                </div>
              </div>
            </div>

            {/* Live Metrics Box */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live City Operations</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">BENGALURU</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[11px] font-semibold text-blue-600 block">Civic Reports</span>
                    <span className="text-2xl font-extrabold text-slate-900">{stats.totalIssues}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] font-semibold text-emerald-600 block">Resolved / Closed</span>
                    <span className="text-2xl font-extrabold text-slate-900">{stats.resolvedIssuesCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Avg. Resolution</span>
                    <span className="text-2xl font-extrabold text-slate-900">{stats.avgResolutionHours}h</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-[11px] font-semibold text-indigo-600 block">SLA Compliance</span>
                    <span className="text-2xl font-extrabold text-slate-900">{stats.slaComplianceRate}%</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>MERN stack REST architecture</span>
                  <Link to="/admin" className="text-blue-600 font-semibold hover:underline">
                    Admin Analytics →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Lifecycle Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Automated Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How CivicFix Guarantees Accountability</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">1</div>
            <h4 className="font-bold text-base text-slate-900 mb-2">Snap, Pin & Deduplicate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload 1–3 photos. The server calculates proximity within <strong>50 meters</strong>. If already filed, you can upvote it in 1 click to boost department priority.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">2</div>
            <h4 className="font-bold text-base text-slate-900 mb-2">Auto-Routing & SLA Clock</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assigned directly to Roads, Sanitation, Electricity, or Water. Officers see live countdowns, and automated cron escalates breached tickets.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">3</div>
            <h4 className="font-bold text-base text-slate-900 mb-2">Proof-of-Fix & Dispute Window</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Officers cannot resolve tickets without attaching a proof-of-fix photo. Citizens have <strong>7 days</strong> to confirm or reopen if work was unsatisfactory.
            </p>
          </div>
        </div>
      </section>

      {/* Live Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Live Civic Issues Map</h3>
            <p className="text-xs text-slate-500">Interactive OpenStreetMap representation of Bengaluru civic hazards.</p>
          </div>
          <Link to="/issues" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
            Fullscreen Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <LeafletMap issues={issues} height="480px" />
      </section>
    </div>
  );
}

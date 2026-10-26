'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Issue } from '@/lib/types';
import { IssueMap } from '@/components/map/IssueMap';
import {
  Shield,
  ArrowRight,
  Camera,
  Layers,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Flame,
} from 'lucide-react';

export default function LandingPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({
    totalIssues: 25,
    resolvedIssuesCount: 16,
    avgResolutionHours: 28,
    slaComplianceRate: 91,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/issues').then((res) => res.json()),
      fetch('/api/stats').then((res) => res.json()),
    ])
      .then(([issuesData, statsData]) => {
        if (Array.isArray(issuesData)) setIssues(issuesData);
        if (statsData?.totalIssues) setStats(statsData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Next-Gen Municipal Transparency</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1]">
                Report it. Track it.{' '}
                <span className="text-blue-600 dark:text-blue-500">Get it fixed.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The smart civic resolution platform for cities. Report potholes, garbage,
                and water leaks in 30 seconds with <strong>50m duplicate detection</strong>,
                department auto-routing, and statutory <strong>SLA countdowns</strong>.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/report"
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm inline-flex items-center justify-center gap-2 group"
                >
                  Report an Issue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/issues"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-xs transition-colors text-sm inline-flex items-center justify-center gap-2"
                >
                  Explore Public Map
                </Link>

                <Link
                  href="/officer/queue"
                  className="w-full sm:w-auto px-5 py-3.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm font-medium inline-flex items-center justify-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4 text-slate-400" /> Officer Portal
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No lost WhatsApp tickets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mandatory photo proof of fix</span>
                </div>
              </div>
            </div>

            {/* Right Card / Live Dashboard Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Live City Operations Feed
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">BENGALURU</span>
                </div>

                {/* Live Database Counters */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
                      Civic Issues Reported
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {stats.totalIssues}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                      Resolved & Closed
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {stats.resolvedIssuesCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Avg. Fix Time
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {stats.avgResolutionHours}h
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                      SLA Compliance
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {stats.slaComplianceRate}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Audited via append-only event ledger</span>
                  <Link
                    href="/admin"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    View Analytics →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3-Step Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Automated Lifecycle
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            How CivicFix Guarantees Accountability
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
              Snap, Pin & Deduplicate
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Take 1–3 photos. The server checks for existing open reports within <strong>50 meters</strong>.
              If already reported, you can upvote it instead with one click to boost priority.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
              Auto-Routing & SLA Clock
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The ticket auto-routes to the designated department (Roads, Sanitation, Electricity, Water).
              Statutory countdowns start ticking, and automated cron escalates overdue tickets.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
              Proof-of-Fix & Dispute Window
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Officers cannot close an issue without attaching a photographic proof-of-fix. Citizens
              have <strong>7 days</strong> to confirm or dispute and reopen if work was unsatisfactory.
            </p>
          </div>
        </div>
      </section>

      {/* PREVIEW OF PUBLIC MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Live City Issue Map
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse transparently filed civic hazard reports across Bengaluru. No login required.
            </p>
          </div>

          <Link
            href="/issues"
            className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
          >
            Open Fullscreen Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <IssueMap issues={issues} height="480px" />
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Spot a pothole or overflowing waste dump right now?
          </h3>
          <p className="text-blue-100 max-w-xl mx-auto text-sm">
            Help improve your neighbourhood in under a minute. Your report directly assigns the local
            inspection crew with statutory SLA deadlines.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/report"
              className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl shadow-md hover:bg-blue-50 transition-colors text-sm"
            >
              Report an Issue Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

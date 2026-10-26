'use client';

import React, { useState, useEffect } from 'react';
import { SLARulesTable } from '@/components/admin/SLARulesTable';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Info } from 'lucide-react';

export default function AdminSLARulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = () => {
    fetch('/api/sla-rules')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRules(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            SLA Statutory Rules Engine
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Define time-to-fix deadlines for each civic hazard category. Breached tickets will
          automatically escalate through Level 1 (Department Head) and Level 2 (City Commissioner).
        </p>
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center gap-3 text-xs text-indigo-800 dark:text-indigo-300">
        <Info className="w-4 h-4 shrink-0 text-indigo-600" />
        <span>
          <strong>Live Demo Mode:</strong> You can set <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded font-mono">SLA_TIME_UNIT=minutes</code> in environment variables to compress hours into minutes for live evaluation.
        </span>
      </div>

      <SLARulesTable rules={rules} onRuleUpdated={fetchRules} />
    </div>
  );
}

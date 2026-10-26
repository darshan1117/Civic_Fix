'use client';

import React, { useState, useEffect } from 'react';
import { Issue } from '@/lib/types';
import { HotspotMap } from '@/components/map/HotspotMap';
import Link from 'next/link';
import { ArrowLeft, Flame, Info } from 'lucide-react';

export default function AdminHotspotsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <Flame className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Civic Hazard Hotspot Analysis
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Geographic density mapping to identify chronically neglected neighborhoods and allocate
          emergency road & drainage repair budgets.
        </p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center gap-3 text-xs text-blue-800 dark:text-blue-300">
        <Info className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          Circles with <strong>red fill</strong> denote high-density hazard areas with 4+ active
          unresolved tickets. <strong>Amber fill</strong> represents moderate density. Tap any
          circle to view cluster stats.
        </span>
      </div>

      <HotspotMap issues={issues} height="650px" />
    </div>
  );
}

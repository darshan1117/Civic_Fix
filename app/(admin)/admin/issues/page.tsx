'use client';

import React, { useState, useEffect } from 'react';
import { Issue } from '@/lib/types';
import { IssuesTable } from '@/components/admin/IssuesTable';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function AdminIssuesDirectoryPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues?sortBy=priority&sortOrder=desc')
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

      <IssuesTable
        issues={issues}
        title="City-Wide Master Issues Directory"
        isOfficerQueue={false}
      />
    </div>
  );
}

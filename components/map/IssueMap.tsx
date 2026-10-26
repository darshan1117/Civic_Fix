'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Issue } from '@/lib/types';
import { MapPin } from 'lucide-react';

const DynamicIssueMapInner = dynamic(() => import('./IssueMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 animate-pulse text-slate-400 gap-2">
      <MapPin className="w-8 h-8 animate-bounce text-blue-600" />
      <span className="text-sm font-medium">Loading interactive civic map...</span>
    </div>
  ),
});

interface IssueMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedCategory?: string;
}

export function IssueMap({
  issues,
  center = [12.9716, 77.5946], // Bengaluru City Center
  zoom = 12,
  height = '500px',
  selectedCategory,
}: IssueMapProps) {
  const filteredIssues =
    selectedCategory && selectedCategory !== 'all'
      ? issues.filter((i) => i.category_id === selectedCategory)
      : issues;

  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0"
    >
      <DynamicIssueMapInner
        issues={filteredIssues}
        center={center}
        zoom={zoom}
      />
    </div>
  );
}

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Issue } from '@/lib/types';
import { Flame } from 'lucide-react';

const DynamicHotspotMapInner = dynamic(() => import('./HotspotMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center animate-pulse text-slate-400 text-xs">
      Loading city hotspot density map...
    </div>
  ),
});

interface HotspotMapProps {
  issues: Issue[];
  height?: string;
}

export function HotspotMap({ issues, height = '500px' }: HotspotMapProps) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0"
    >
      <DynamicHotspotMapInner issues={issues} />
    </div>
  );
}

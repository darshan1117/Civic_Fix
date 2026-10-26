'use client';

import React, { useEffect, useState } from 'react';
import { getSLAInfo, SLAInfo } from '@/lib/sla';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SLACountdownBadgeProps {
  createdAt: string;
  slaDeadline: string;
  isCompleted?: boolean;
  className?: string;
  showPercent?: boolean;
}

export function SLACountdownBadge({
  createdAt,
  slaDeadline,
  isCompleted = false,
  className,
  showPercent = false,
}: SLACountdownBadgeProps) {
  const [sla, setSla] = useState<SLAInfo>(() =>
    getSLAInfo(createdAt, slaDeadline, new Date())
  );

  useEffect(() => {
    if (isCompleted) return;

    // Refresh SLA timer every 30 seconds
    const interval = setInterval(() => {
      setSla(getSLAInfo(createdAt, slaDeadline, new Date()));
    }, 30000);

    return () => clearInterval(interval);
  }, [createdAt, slaDeadline, isCompleted]);

  if (isCompleted) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200',
          className
        )}
      >
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        SLA Met / Resolved
      </span>
    );
  }

  const styles = {
    safe: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: Clock,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
    },
    overdue: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300 animate-pulse',
      border: 'border-rose-300 dark:border-rose-800',
      icon: ShieldAlert,
    },
  };

  const currentStyle = styles[sla.status];
  const Icon = currentStyle.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-all',
        currentStyle.bg,
        currentStyle.text,
        currentStyle.border,
        className
      )}
      title={`SLA: ${sla.percentRemaining}% remaining`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{sla.humanRemaining}</span>
      {showPercent && !sla.isOverdue && (
        <span className="opacity-75 font-normal">({sla.percentRemaining}%)</span>
      )}
    </div>
  );
}

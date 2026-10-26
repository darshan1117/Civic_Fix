import React from 'react';
import { IssueStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Clock,
  Eye,
  Wrench,
  CheckCircle2,
  Lock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const configs: Record<
    IssueStatus,
    { bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    Submitted: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
      icon: Clock,
    },
    Acknowledged: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Eye,
    },
    'In Progress': {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Wrench,
    },
    Resolved: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    Closed: {
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-300 dark:border-slate-700',
      icon: Lock,
    },
    Rejected: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: XCircle,
    },
    Reopened: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: AlertCircle,
    },
  };

  const config = configs[status] || configs.Submitted;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors shadow-xs',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      <span>{status}</span>
    </span>
  );
}

import React from 'react';
import { Clock, Eye, Wrench, CheckCircle2, Lock, XCircle, AlertCircle } from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const configs = {
    Submitted: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: Clock },
    Acknowledged: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Eye },
    'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Wrench },
    Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    Closed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: Lock },
    Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
    Reopened: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertCircle },
  };

  const config = configs[status] || configs.Submitted;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
}

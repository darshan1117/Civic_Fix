import React from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface StatCardsProps {
  stats: {
    totalIssues: number;
    openIssuesCount: number;
    resolvedIssuesCount: number;
    rejectedIssuesCount: number;
    escalatedCount: number;
    avgResolutionHours: number;
    slaComplianceRate: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: 'Total Civic Reports',
      value: stats.totalIssues,
      subtext: 'Across all departments',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900',
    },
    {
      title: 'Active Open Issues',
      value: stats.openIssuesCount,
      subtext: 'In queue or under repair',
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900',
    },
    {
      title: 'Resolved & Closed',
      value: stats.resolvedIssuesCount,
      subtext: 'Verified by citizens/officers',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900',
    },
    {
      title: 'SLA Compliance Rate',
      value: `${stats.slaComplianceRate}%`,
      subtext: 'Resolved within deadline',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900',
    },
    {
      title: 'Avg. Resolution Time',
      value: `${stats.avgResolutionHours} hrs`,
      subtext: 'From report to fix',
      icon: Clock,
      color: 'text-slate-700 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800',
      border: 'border-slate-200 dark:border-slate-700',
    },
    {
      title: 'SLA Escalations',
      value: stats.escalatedCount,
      subtext: 'Level 1 & Level 2 breaches',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${card.border} shadow-xs space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 line-clamp-1">{card.title}</span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {card.value}
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { IssueEvent } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import {
  Clock,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface IssueTimelineProps {
  events: IssueEvent[];
}

export function IssueTimeline({ events }: IssueTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4 italic">
        No lifecycle events recorded yet.
      </div>
    );
  }

  // Sort ascending by time
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sortedEvents.map((event, idx) => {
        const isEscalation = event.event_type === 'escalation';
        const isReopened = event.event_type === 'reopened';
        const isResolved = event.to_status === 'Resolved';
        const isClosed = event.to_status === 'Closed';

        let iconNode = (
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
            <Clock className="w-3.5 h-3.5" />
          </div>
        );

        if (isEscalation) {
          iconNode = (
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          );
        } else if (isReopened) {
          iconNode = (
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          );
        } else if (isResolved || isClosed) {
          iconNode = (
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          );
        }

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline pin */}
            <div className="absolute -left-6 top-1 -translate-x-1/2">
              {iconNode}
            </div>

            {/* Event Content Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {event.actor_name || 'System Auto-Process'}
                  </span>
                  {event.actor_role && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {event.actor_role}
                    </span>
                  )}
                </div>
                <time className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTime(event.created_at)}
                </time>
              </div>

              {/* Status Transition Header if applicable */}
              {event.to_status && (
                <div className="flex items-center gap-2 my-2 text-xs">
                  {event.from_status ? (
                    <>
                      <StatusBadge status={event.from_status} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <StatusBadge status={event.to_status} size="sm" />
                    </>
                  ) : (
                    <StatusBadge status={event.to_status} size="sm" />
                  )}
                </div>
              )}

              {/* Note / Description */}
              {event.note && (
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 mt-2 border border-slate-100 dark:border-slate-800">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

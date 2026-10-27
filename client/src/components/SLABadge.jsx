import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export function SLABadge({ createdAt, slaDeadline, isCompleted = false }) {
  const [remainingStr, setRemainingStr] = useState('');
  const [slaStatus, setSlaStatus] = useState('safe');

  const update = () => {
    if (isCompleted) return;

    const created = new Date(createdAt).getTime();
    const deadline = new Date(slaDeadline).getTime();
    const now = Date.now();

    const totalMs = Math.max(1, deadline - created);
    const diff = deadline - now;
    const isOverdue = diff <= 0;

    const pct = isOverdue ? 0 : Math.min(100, Math.max(0, Math.round((diff / totalMs) * 100)));

    if (isOverdue) setSlaStatus('overdue');
    else if (pct <= 50) setSlaStatus('warning');
    else setSlaStatus('safe');

    const absMs = Math.abs(diff);
    const totalMins = Math.floor(absMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const days = Math.floor(hrs / 24);

    if (isOverdue) {
      if (days > 0) setRemainingStr(`${days}d ${hrs % 24}h overdue`);
      else if (hrs > 0) setRemainingStr(`${hrs}h ${mins}m overdue`);
      else setRemainingStr(`${Math.max(1, mins)}m overdue`);
    } else {
      if (days > 0) setRemainingStr(`${days}d ${hrs % 24}h left`);
      else if (hrs > 0) setRemainingStr(`${hrs}h ${mins}m left`);
      else setRemainingStr(`${Math.max(1, mins)}m left`);
    }
  };

  useEffect(() => {
    update();
    const timer = setInterval(update, 20000);
    return () => clearInterval(timer);
  }, [createdAt, slaDeadline, isCompleted]);

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        SLA Met / Resolved
      </span>
    );
  }

  const styles = {
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse',
  };

  const Icon = slaStatus === 'overdue' ? ShieldAlert : slaStatus === 'warning' ? AlertTriangle : Clock;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs ${styles[slaStatus]}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{remainingStr}</span>
    </div>
  );
}

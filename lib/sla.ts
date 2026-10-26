/**
 * SLA calculation and countdown utilities.
 * Supports SLA_TIME_UNIT=hours|minutes for demo mode.
 */

export function getSLATimeUnit(): 'hours' | 'minutes' {
  if (typeof process !== 'undefined' && process.env?.SLA_TIME_UNIT === 'minutes') {
    return 'minutes';
  }
  return 'hours';
}

/**
 * Computes SLA deadline given a start time and standard SLA hours.
 * When timeUnit is 'minutes', 1 hour of SLA is compressed to 1 minute for live demonstration.
 */
export function calculateSLADeadline(
  startTime: Date = new Date(),
  slaHours: number = 48,
  timeUnit: 'hours' | 'minutes' = getSLATimeUnit()
): Date {
  const deadline = new Date(startTime.getTime());
  if (timeUnit === 'minutes') {
    // Demo mode: 1 SLA hour = 1 minute
    deadline.setMinutes(deadline.getMinutes() + slaHours);
  } else {
    // Normal mode: hours
    deadline.setHours(deadline.getHours() + slaHours);
  }
  return deadline;
}

export interface SLAInfo {
  status: 'safe' | 'warning' | 'overdue';
  percentRemaining: number;
  humanRemaining: string;
  isOverdue: boolean;
  totalDurationMs: number;
  elapsedMs: number;
  remainingMs: number;
}

/**
 * Evaluates current SLA condition:
 * - Green (safe): > 50% time left
 * - Amber (warning): <= 50% time left
 * - Red (overdue): expired
 */
export function getSLAInfo(
  createdAtStr: string | Date,
  slaDeadlineStr: string | Date,
  currentTime: Date = new Date()
): SLAInfo {
  const created = new Date(createdAtStr).getTime();
  const deadline = new Date(slaDeadlineStr).getTime();
  const now = currentTime.getTime();

  const totalDurationMs = Math.max(1, deadline - created);
  const remainingMs = deadline - now;
  const elapsedMs = now - created;

  const isOverdue = remainingMs <= 0;
  const percentRemaining = isOverdue
    ? 0
    : Math.min(100, Math.max(0, Math.round((remainingMs / totalDurationMs) * 100)));

  let status: 'safe' | 'warning' | 'overdue' = 'safe';
  if (isOverdue) {
    status = 'overdue';
  } else if (percentRemaining <= 50) {
    status = 'warning';
  }

  // Format human remaining string
  const absRemaining = Math.abs(remainingMs);
  const totalMinutes = Math.floor(absRemaining / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);

  let humanRemaining = '';
  if (isOverdue) {
    if (days > 0) humanRemaining = `${days}d ${hours % 24}h overdue`;
    else if (hours > 0) humanRemaining = `${hours}h ${minutes}m overdue`;
    else humanRemaining = `${Math.max(1, minutes)}m overdue`;
  } else {
    if (days > 0) humanRemaining = `${days}d ${hours % 24}h left`;
    else if (hours > 0) humanRemaining = `${hours}h ${minutes}m left`;
    else humanRemaining = `${Math.max(1, minutes)}m left`;
  }

  return {
    status,
    percentRemaining,
    humanRemaining,
    isOverdue,
    totalDurationMs,
    elapsedMs,
    remainingMs,
  };
}

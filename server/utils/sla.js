export function getSLATimeUnit() {
  return process.env.SLA_TIME_UNIT === 'minutes' ? 'minutes' : 'hours';
}

export function calculateSLADeadline(startTime = new Date(), slaHours = 48, timeUnit = getSLATimeUnit()) {
  const deadline = new Date(startTime.getTime());
  if (timeUnit === 'minutes') {
    deadline.setMinutes(deadline.getMinutes() + slaHours);
  } else {
    deadline.setHours(deadline.getHours() + slaHours);
  }
  return deadline;
}

export function getSLAInfo(createdAtStr, slaDeadlineStr, currentTime = new Date()) {
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

  let status = 'safe';
  if (isOverdue) {
    status = 'overdue';
  } else if (percentRemaining <= 50) {
    status = 'warning';
  }

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

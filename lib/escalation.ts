import { IssueStatus, IssueEvent } from './types';
import { getSLATimeUnit } from './sla';

export interface EscalationCandidate {
  id: string;
  status: IssueStatus;
  sla_deadline: string;
  escalation_level: 0 | 1 | 2;
  created_at: string;
  events?: IssueEvent[];
}

export interface EscalationDecision {
  shouldEscalate: boolean;
  newLevel?: 1 | 2;
  reason?: string;
  targetRole?: 'department_head' | 'admin';
}

/**
 * Pure function to evaluate if an issue should be escalated.
 * Enforces strict idempotency: multiple runs at the same point in time will not re-escalate.
 */
export function evaluateEscalation(
  issue: EscalationCandidate,
  currentTime: Date = new Date()
): EscalationDecision {
  // 1. Terminal or completed statuses are never escalated
  if (
    issue.status === 'Resolved' ||
    issue.status === 'Closed' ||
    issue.status === 'Rejected'
  ) {
    return { shouldEscalate: false, reason: `Status '${issue.status}' does not warrant escalation.` };
  }

  const deadline = new Date(issue.sla_deadline).getTime();
  const now = currentTime.getTime();

  // 2. If not past deadline, no escalation
  if (now <= deadline) {
    return { shouldEscalate: false, reason: 'Issue is currently within SLA deadline.' };
  }

  const overdueMs = now - deadline;
  const isDemoMinutes = getSLATimeUnit() === 'minutes';

  // 3. Level 0 -> Level 1 (Immediate escalation upon breach)
  if (issue.escalation_level === 0) {
    return {
      shouldEscalate: true,
      newLevel: 1,
      targetRole: 'department_head',
      reason: 'SLA deadline breached. Escalated to Level 1 (Department Head notified).',
    };
  }

  // 4. Level 1 -> Level 2 (Severe overdue threshold)
  // Normal mode: 24 hours past initial breach (or 5 minutes in demo mode)
  const level2ThresholdMs = isDemoMinutes ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;

  if (issue.escalation_level === 1) {
    if (overdueMs >= level2ThresholdMs) {
      return {
        shouldEscalate: true,
        newLevel: 2,
        targetRole: 'admin',
        reason: 'SLA overdue beyond Level 1 threshold. Escalated to Level 2 (City Admin notified).',
      };
    }
    // Idempotent: Level 1 already applied, threshold not yet reached for Level 2
    return {
      shouldEscalate: false,
      reason: 'Issue is already at Level 1 and has not passed the Level 2 overdue threshold.',
    };
  }

  // 5. Level 2 is max escalation
  return {
    shouldEscalate: false,
    reason: 'Issue is already at maximum escalation Level 2.',
  };
}

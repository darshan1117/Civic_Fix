import { IssueStatus, UserRole } from './types';

export interface TransitionContext {
  from: IssueStatus;
  to: IssueStatus;
  role: UserRole | 'system';
  isReporter?: boolean;
  note?: string | null;
  proofPhotoUrl?: string | null;
  resolvedAt?: string | null;
  currentDate?: Date;
}

export interface TransitionResult {
  valid: boolean;
  error?: string;
}

/**
 * Allowed transitions mapping in CivicFix state machine:
 * Submitted -> Acknowledged, Rejected
 * Acknowledged -> In Progress, Rejected
 * In Progress -> Resolved (Requires proof-of-fix photo and note)
 * Resolved -> Closed (Citizen confirm or 7-day timer), Reopened (Citizen dispute within 7 days)
 * Reopened -> In Progress, Acknowledged
 * Closed -> Terminal (No transitions)
 * Rejected -> Terminal (No transitions)
 */
export const ALLOWED_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  Submitted: ['Acknowledged', 'Rejected'],
  Acknowledged: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed', 'Reopened'],
  Reopened: ['In Progress', 'Acknowledged'],
  Closed: [],
  Rejected: [],
};

/**
 * Pure state machine transition validator.
 * Enforces workflow transitions, role permissions, proof requirements, and dispute windows.
 */
export function validateStatusTransition(context: TransitionContext): TransitionResult {
  const {
    from,
    to,
    role,
    isReporter = false,
    note,
    proofPhotoUrl,
    resolvedAt,
    currentDate = new Date(),
  } = context;

  // 1. Check if from and to are valid known statuses
  const allowedNext = ALLOWED_TRANSITIONS[from];
  if (!allowedNext) {
    return { valid: false, error: `Invalid current status '${from}'.` };
  }

  // 2. Check if the graph transition is valid
  if (!allowedNext.includes(to)) {
    return {
      valid: false,
      error: `Transition from '${from}' to '${to}' is not permitted in the issue lifecycle.`,
    };
  }

  // 3. Enforce Role-based permissions
  if (to === 'Acknowledged' || to === 'In Progress') {
    if (role !== 'officer' && role !== 'admin') {
      return {
        valid: false,
        error: `Only municipal officers or administrators can move issues to '${to}'.`,
      };
    }
  }

  if (to === 'Rejected') {
    if (role !== 'officer' && role !== 'admin') {
      return {
        valid: false,
        error: `Only municipal officers or administrators can reject an issue.`,
      };
    }
    if (!note || note.trim().length < 5) {
      return {
        valid: false,
        error: 'A specific rejection reason (at least 5 characters) is required to reject an issue.',
      };
    }
  }

  if (to === 'Resolved') {
    if (role !== 'officer' && role !== 'admin') {
      return {
        valid: false,
        error: `Only assigned officers or administrators can resolve issues.`,
      };
    }
    if (!proofPhotoUrl || !proofPhotoUrl.trim()) {
      return {
        valid: false,
        error: 'Proof-of-fix photo is mandatory to resolve an issue.',
      };
    }
    if (!note || note.trim().length < 5) {
      return {
        valid: false,
        error: 'A resolution note describing the fix completed is required.',
      };
    }
  }

  if (to === 'Closed') {
    // Closed can be triggered by the reporting citizen (confirmation), by an admin, or by system cron
    if (role !== 'admin' && role !== 'system' && !isReporter) {
      return {
        valid: false,
        error: 'Only the citizen who reported the issue, an administrator, or the system auto-close job can close it.',
      };
    }
  }

  if (to === 'Reopened') {
    // Only citizen who reported or admin can reopen
    if (!isReporter && role !== 'admin') {
      return {
        valid: false,
        error: 'Only the reporting citizen or an administrator can reopen a resolved issue.',
      };
    }
    if (!note || note.trim().length < 5) {
      return {
        valid: false,
        error: 'Please describe why the resolution was unsatisfactory to reopen the issue.',
      };
    }
    // Check 7-day dispute window
    if (resolvedAt) {
      const resolvedDate = new Date(resolvedAt);
      const diffMs = currentDate.getTime() - resolvedDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return {
          valid: false,
          error: 'Issues can only be disputed within 7 days of being marked Resolved.',
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Returns available next statuses for a given status and user role
 */
export function getAvailableTransitions(
  currentStatus: IssueStatus,
  role: UserRole,
  isReporter: boolean = false
): IssueStatus[] {
  const possible = ALLOWED_TRANSITIONS[currentStatus] || [];
  return possible.filter((nextStatus) => {
    if (nextStatus === 'Acknowledged' || nextStatus === 'In Progress' || nextStatus === 'Rejected' || nextStatus === 'Resolved') {
      return role === 'officer' || role === 'admin';
    }
    if (nextStatus === 'Closed') {
      return isReporter || role === 'admin';
    }
    if (nextStatus === 'Reopened') {
      return isReporter || role === 'admin';
    }
    return false;
  });
}

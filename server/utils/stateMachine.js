export const ALLOWED_TRANSITIONS = {
  Submitted: ['Acknowledged', 'Rejected'],
  Acknowledged: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed', 'Reopened'],
  Reopened: ['In Progress', 'Acknowledged'],
  Closed: [],
  Rejected: [],
};

export function validateStatusTransition(context) {
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

  const allowedNext = ALLOWED_TRANSITIONS[from];
  if (!allowedNext) {
    return { valid: false, error: `Invalid current status '${from}'.` };
  }

  if (!allowedNext.includes(to)) {
    return {
      valid: false,
      error: `Transition from '${from}' to '${to}' is not permitted in the issue lifecycle.`,
    };
  }

  // Officer / Admin role checks
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

  // Moving to Resolved REQUIRES a proof-of-fix photo and a note
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
    if (role !== 'admin' && role !== 'system' && !isReporter) {
      return {
        valid: false,
        error: 'Only the citizen who reported the issue or an administrator can close it.',
      };
    }
  }

  if (to === 'Reopened') {
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
    if (resolvedAt) {
      const diffMs = currentDate.getTime() - new Date(resolvedAt).getTime();
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

export function getAvailableTransitions(currentStatus, role, isReporter = false) {
  const possible = ALLOWED_TRANSITIONS[currentStatus] || [];
  return possible.filter((nextStatus) => {
    if (['Acknowledged', 'In Progress', 'Rejected', 'Resolved'].includes(nextStatus)) {
      return role === 'officer' || role === 'admin';
    }
    if (nextStatus === 'Closed' || nextStatus === 'Reopened') {
      return isReporter || role === 'admin';
    }
    return false;
  });
}

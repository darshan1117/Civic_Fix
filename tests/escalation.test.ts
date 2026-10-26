import { describe, it, expect } from 'vitest';
import { evaluateEscalation, EscalationCandidate } from '../lib/escalation';

describe('SLA Escalation Engine & Idempotency', () => {
  const baseCreated = '2026-10-25T00:00:00Z';
  const deadline = '2026-10-26T00:00:00Z'; // Passed

  it('does not escalate issues within SLA deadline', () => {
    const futureDeadline = '2026-10-28T00:00:00Z';
    const currentTime = new Date('2026-10-27T00:00:00Z');

    const issue: EscalationCandidate = {
      id: 'issue-1',
      status: 'In Progress',
      sla_deadline: futureDeadline,
      escalation_level: 0,
      created_at: baseCreated,
    };

    const decision = evaluateEscalation(issue, currentTime);
    expect(decision.shouldEscalate).toBe(false);
  });

  it('escalates Level 0 to Level 1 once deadline passes', () => {
    const currentTime = new Date('2026-10-26T02:00:00Z'); // 2h past deadline

    const issue: EscalationCandidate = {
      id: 'issue-1',
      status: 'Submitted',
      sla_deadline: deadline,
      escalation_level: 0,
      created_at: baseCreated,
    };

    const decision = evaluateEscalation(issue, currentTime);
    expect(decision.shouldEscalate).toBe(true);
    expect(decision.newLevel).toBe(1);
    expect(decision.targetRole).toBe('department_head');
  });

  it('is strictly idempotent when running repeatedly at Level 1 before Level 2 threshold', () => {
    const currentTime = new Date('2026-10-26T06:00:00Z'); // 6h past deadline (<24h threshold)

    const issue: EscalationCandidate = {
      id: 'issue-1',
      status: 'Acknowledged',
      sla_deadline: deadline,
      escalation_level: 1, // Already escalated to Level 1
      created_at: baseCreated,
    };

    // First check
    const decision1 = evaluateEscalation(issue, currentTime);
    expect(decision1.shouldEscalate).toBe(false);
    expect(decision1.reason).toContain('already at Level 1');

    // Second check (cron run 15 mins later)
    const nextCron = new Date('2026-10-26T06:15:00Z');
    const decision2 = evaluateEscalation(issue, nextCron);
    expect(decision2.shouldEscalate).toBe(false);
  });

  it('escalates Level 1 to Level 2 after severe overdue threshold (>24h overdue)', () => {
    const currentTime = new Date('2026-10-27T01:00:00Z'); // 25h past deadline

    const issue: EscalationCandidate = {
      id: 'issue-1',
      status: 'In Progress',
      sla_deadline: deadline,
      escalation_level: 1,
      created_at: baseCreated,
    };

    const decision = evaluateEscalation(issue, currentTime);
    expect(decision.shouldEscalate).toBe(true);
    expect(decision.newLevel).toBe(2);
    expect(decision.targetRole).toBe('admin');
  });

  it('does not escalate further when already at maximum Level 2', () => {
    const currentTime = new Date('2026-10-28T00:00:00Z'); // 48h past deadline

    const issue: EscalationCandidate = {
      id: 'issue-1',
      status: 'In Progress',
      sla_deadline: deadline,
      escalation_level: 2,
      created_at: baseCreated,
    };

    const decision = evaluateEscalation(issue, currentTime);
    expect(decision.shouldEscalate).toBe(false);
    expect(decision.reason).toContain('maximum escalation');
  });

  it('never escalates Resolved, Closed, or Rejected issues even if past deadline', () => {
    const currentTime = new Date('2026-10-27T00:00:00Z');

    const resolved: EscalationCandidate = {
      id: 'res-1',
      status: 'Resolved',
      sla_deadline: deadline,
      escalation_level: 0,
      created_at: baseCreated,
    };
    expect(evaluateEscalation(resolved, currentTime).shouldEscalate).toBe(false);

    const closed: EscalationCandidate = {
      id: 'close-1',
      status: 'Closed',
      sla_deadline: deadline,
      escalation_level: 0,
      created_at: baseCreated,
    };
    expect(evaluateEscalation(closed, currentTime).shouldEscalate).toBe(false);

    const rejected: EscalationCandidate = {
      id: 'rej-1',
      status: 'Rejected',
      sla_deadline: deadline,
      escalation_level: 0,
      created_at: baseCreated,
    };
    expect(evaluateEscalation(rejected, currentTime).shouldEscalate).toBe(false);
  });
});

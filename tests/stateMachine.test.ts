import { describe, it, expect } from 'vitest';
import { validateStatusTransition, getAvailableTransitions } from '../lib/stateMachine';

describe('Issue State Machine', () => {
  it('allows valid officer transition from Submitted to Acknowledged', () => {
    const result = validateStatusTransition({
      from: 'Submitted',
      to: 'Acknowledged',
      role: 'officer',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects citizen attempting to Acknowledge or In Progress an issue', () => {
    const result = validateStatusTransition({
      from: 'Submitted',
      to: 'Acknowledged',
      role: 'citizen',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Only municipal officers or administrators');
  });

  it('rejects transition from Submitted directly to Resolved', () => {
    const result = validateStatusTransition({
      from: 'Submitted',
      to: 'Resolved',
      role: 'officer',
      proofPhotoUrl: 'https://example.com/proof.jpg',
      note: 'Done',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not permitted');
  });

  it('requires a proof-of-fix photo and note when transitioning In Progress to Resolved', () => {
    const missingPhoto = validateStatusTransition({
      from: 'In Progress',
      to: 'Resolved',
      role: 'officer',
      note: 'Road resurfaced with hot asphalt mix',
    });
    expect(missingPhoto.valid).toBe(false);
    expect(missingPhoto.error).toContain('Proof-of-fix photo is mandatory');

    const missingNote = validateStatusTransition({
      from: 'In Progress',
      to: 'Resolved',
      role: 'officer',
      proofPhotoUrl: 'https://example.com/proof.jpg',
      note: '',
    });
    expect(missingNote.valid).toBe(false);
    expect(missingNote.error).toContain('resolution note');

    const validResolution = validateStatusTransition({
      from: 'In Progress',
      to: 'Resolved',
      role: 'officer',
      proofPhotoUrl: 'https://example.com/proof.jpg',
      note: 'Fixed streetlight wiring and replaced LED bulb fixture.',
    });
    expect(validResolution.valid).toBe(true);
  });

  it('requires a clear reason when rejecting an issue', () => {
    const noReason = validateStatusTransition({
      from: 'Submitted',
      to: 'Rejected',
      role: 'officer',
      note: '',
    });
    expect(noReason.valid).toBe(false);
    expect(noReason.error).toContain('rejection reason');

    const validReject = validateStatusTransition({
      from: 'Submitted',
      to: 'Rejected',
      role: 'admin',
      note: 'Private residential property beyond municipal jurisdiction.',
    });
    expect(validReject.valid).toBe(true);
  });

  it('allows reporting citizen to confirm and close a resolved issue', () => {
    const result = validateStatusTransition({
      from: 'Resolved',
      to: 'Closed',
      role: 'citizen',
      isReporter: true,
    });
    expect(result.valid).toBe(true);
  });

  it('prevents non-reporter citizen from closing a resolved issue', () => {
    const result = validateStatusTransition({
      from: 'Resolved',
      to: 'Closed',
      role: 'citizen',
      isReporter: false,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Only the citizen who reported');
  });

  it('allows reporting citizen to reopen a resolved issue within 7 days with note', () => {
    const resolvedAt = new Date('2026-10-25T10:00:00Z').toISOString();
    const currentDate = new Date('2026-10-27T10:00:00Z'); // 2 days later

    const result = validateStatusTransition({
      from: 'Resolved',
      to: 'Reopened',
      role: 'citizen',
      isReporter: true,
      resolvedAt,
      currentDate,
      note: 'Pothole gravel washed out during morning rains; hole is back.',
    });
    expect(result.valid).toBe(true);
  });

  it('blocks reopening after 7 days have elapsed', () => {
    const resolvedAt = new Date('2026-10-15T10:00:00Z').toISOString();
    const currentDate = new Date('2026-10-27T10:00:00Z'); // 12 days later

    const result = validateStatusTransition({
      from: 'Resolved',
      to: 'Reopened',
      role: 'citizen',
      isReporter: true,
      resolvedAt,
      currentDate,
      note: 'Issue recurred',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('7 days');
  });

  it('prohibits transitions from terminal states Closed and Rejected', () => {
    expect(
      validateStatusTransition({ from: 'Closed', to: 'In Progress', role: 'admin' }).valid
    ).toBe(false);

    expect(
      validateStatusTransition({ from: 'Rejected', to: 'Submitted', role: 'admin' }).valid
    ).toBe(false);
  });

  it('computes correct available transitions for roles', () => {
    const officerTransitions = getAvailableTransitions('Submitted', 'officer');
    expect(officerTransitions).toEqual(['Acknowledged', 'Rejected']);

    const citizenTransitions = getAvailableTransitions('Resolved', 'citizen', true);
    expect(citizenTransitions).toEqual(['Closed', 'Reopened']);
  });
});

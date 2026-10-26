import { describe, it, expect } from 'vitest';
import { calculateSLADeadline, getSLAInfo } from '../lib/sla';

describe('SLA Deadline & Countdown Logic', () => {
  it('calculates deadline in hours correctly', () => {
    const start = new Date('2026-10-27T10:00:00Z');
    const deadline = calculateSLADeadline(start, 24, 'hours');
    expect(deadline.toISOString()).toBe('2026-10-28T10:00:00.000Z');
  });

  it('supports demo mode with minutes calculation', () => {
    const start = new Date('2026-10-27T10:00:00Z');
    const deadline = calculateSLADeadline(start, 30, 'minutes');
    expect(deadline.toISOString()).toBe('2026-10-27T10:30:00.000Z');
  });

  it('reports safe status (>50% remaining)', () => {
    const created = '2026-10-27T00:00:00Z';
    const deadline = '2026-10-29T00:00:00Z'; // 48h total
    const now = new Date('2026-10-27T12:00:00Z'); // 36h remaining (75%)

    const info = getSLAInfo(created, deadline, now);
    expect(info.status).toBe('safe');
    expect(info.percentRemaining).toBe(75);
    expect(info.isOverdue).toBe(false);
  });

  it('reports warning status (<=50% remaining)', () => {
    const created = '2026-10-27T00:00:00Z';
    const deadline = '2026-10-29T00:00:00Z'; // 48h total
    const now = new Date('2026-10-28T12:00:00Z'); // 12h remaining (25%)

    const info = getSLAInfo(created, deadline, now);
    expect(info.status).toBe('warning');
    expect(info.percentRemaining).toBe(25);
    expect(info.isOverdue).toBe(false);
  });

  it('reports overdue status when deadline has passed', () => {
    const created = '2026-10-25T00:00:00Z';
    const deadline = '2026-10-26T00:00:00Z';
    const now = new Date('2026-10-27T00:00:00Z'); // 24h past deadline

    const info = getSLAInfo(created, deadline, now);
    expect(info.status).toBe('overdue');
    expect(info.isOverdue).toBe(true);
    expect(info.percentRemaining).toBe(0);
    expect(info.humanRemaining).toContain('overdue');
  });
});

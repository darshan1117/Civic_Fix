import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, UPVOTE_WEIGHT, AGE_DAYS_WEIGHT, SEVERITY_MULTIPLIER } from '../lib/priority';

describe('Priority Scoring Logic', () => {
  it('calculates baseline score for fresh issue with 0 upvotes', () => {
    const now = new Date('2026-10-27T10:00:00Z');
    const score = calculatePriorityScore({
      upvoteCount: 0,
      createdAt: now,
      categorySeverity: 5,
      currentTime: now,
    });

    // 0 * 2.5 + 0 * 1.5 + 5 * 3.0 = 15.0
    expect(score).toBe(15.0);
  });

  it('multiplies upvotes by 2.5 correctly', () => {
    const now = new Date('2026-10-27T10:00:00Z');
    const score = calculatePriorityScore({
      upvoteCount: 10,
      createdAt: now,
      categorySeverity: 5,
      currentTime: now,
    });

    // 10 * 2.5 + 15 = 40.0
    expect(score).toBe(40.0);
  });

  it('increments score as age increases', () => {
    const createdAt = new Date('2026-10-25T10:00:00Z'); // 2 days old
    const currentTime = new Date('2026-10-27T10:00:00Z');

    const score = calculatePriorityScore({
      upvoteCount: 0,
      createdAt,
      categorySeverity: 5,
      currentTime,
    });

    // 0 + (2 days * 1.5) + (5 * 3.0) = 3 + 15 = 18.0
    expect(score).toBe(18.0);
  });

  it('prioritizes high-severity water leakage (severity 9) over low-severity other (severity 4)', () => {
    const now = new Date('2026-10-27T10:00:00Z');

    const waterLeakageScore = calculatePriorityScore({
      upvoteCount: 5,
      createdAt: now,
      categorySeverity: 9,
      currentTime: now,
    });

    const otherIssueScore = calculatePriorityScore({
      upvoteCount: 5,
      createdAt: now,
      categorySeverity: 4,
      currentTime: now,
    });

    expect(waterLeakageScore).toBeGreaterThan(otherIssueScore);
    expect(waterLeakageScore - otherIssueScore).toBe((9 - 4) * SEVERITY_MULTIPLIER);
  });

  it('handles negative or invalid edge cases safely', () => {
    const now = new Date('2026-10-27T10:00:00Z');
    const futureDate = new Date('2026-10-28T10:00:00Z');

    const score = calculatePriorityScore({
      upvoteCount: -5,
      createdAt: futureDate, // Future date clamp to 0 age
      categorySeverity: -2,  // Clamped to 1
      currentTime: now,
    });

    // 0 * 2.5 + 0 * 1.5 + 1 * 3.0 = 3.0
    expect(score).toBe(3.0);
  });
});

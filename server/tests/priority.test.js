import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityScore } from '../utils/priority.js';
import { calculateSLADeadline, getSLAInfo } from '../utils/sla.js';

test('Priority: increases monotonically with upvote count', () => {
  const now = new Date();
  const scoreLow = calculatePriorityScore({
    upvoteCount: 0,
    createdAt: now,
    categorySeverity: 5,
    currentTime: now,
  });

  const scoreHigh = calculatePriorityScore({
    upvoteCount: 10,
    createdAt: now,
    categorySeverity: 5,
    currentTime: now,
  });

  assert.ok(scoreHigh > scoreLow, `Expected score with 10 upvotes (${scoreHigh}) > score with 0 (${scoreLow})`);
});

test('SLA: accurately calculates future deadline', () => {
  const start = new Date('2026-10-27T10:00:00Z');
  const deadline = calculateSLADeadline(start, 24, 'hours'); // 24 hours
  const expected = new Date('2026-10-28T10:00:00Z');
  assert.equal(deadline.toISOString(), expected.toISOString());
});

test('SLA: correctly identifies overdue breach', () => {
  const created = new Date(Date.now() - 48 * 3600 * 1000);
  const deadline = new Date(Date.now() - 24 * 3600 * 1000); // 24 hours ago
  const info = getSLAInfo(created, deadline);
  assert.equal(info.isOverdue, true);
  assert.equal(info.percentRemaining, 0);
  assert.equal(info.status, 'overdue');
});

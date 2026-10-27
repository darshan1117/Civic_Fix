import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStatusTransition } from '../utils/stateMachine.js';
import { calculateHaversineDistance } from '../utils/haversine.js';
import { calculatePriorityScore } from '../utils/priority.js';
import { calculateSLADeadline, getSLAInfo } from '../utils/sla.js';

test('Edge Case: Haversine distance with extreme coordinates (North Pole to South Pole)', () => {
  const dist = calculateHaversineDistance(90, 0, -90, 0);
  assert.ok(dist > 19000000 && dist < 21000000, `Expected ~20,000km, got ${dist}m`);
});

test('Edge Case: State Machine rejects transition when note is less than 5 characters for rejection', () => {
  const res = validateStatusTransition({
    from: 'Submitted',
    to: 'Rejected',
    role: 'officer',
    note: 'bad', // only 3 chars
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /at least 5 characters/i);
});

test('Edge Case: State Machine rejects Resolve when resolution note is empty whitespace', () => {
  const res = validateStatusTransition({
    from: 'In Progress',
    to: 'Resolved',
    role: 'officer',
    proofPhotoUrl: 'data:image/jpeg;base64,sample',
    note: '     ',
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /resolution note/i);
});

test('Edge Case: Citizen cannot move issue from Submitted to In Progress', () => {
  const res = validateStatusTransition({
    from: 'Submitted',
    to: 'In Progress',
    role: 'citizen',
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /not permitted/i);
});

test('Edge Case: Terminal state Closed cannot transition to anything', () => {
  const res = validateStatusTransition({
    from: 'Closed',
    to: 'In Progress',
    role: 'admin',
  });
  assert.equal(res.valid, false);
});

test('Edge Case: Terminal state Rejected cannot transition to anything', () => {
  const res = validateStatusTransition({
    from: 'Rejected',
    to: 'Submitted',
    role: 'admin',
  });
  assert.equal(res.valid, false);
});

test('Edge Case: SLA countdown handles deadline equal to created time without division by zero', () => {
  const sameTime = new Date('2026-10-27T10:00:00Z');
  const info = getSLAInfo(sameTime, sameTime, sameTime);
  assert.ok(info !== null);
  assert.equal(info.isOverdue, true);
});

test('Edge Case: Priority score calculation with 0 upvotes and brand new issue', () => {
  const now = new Date();
  const score = calculatePriorityScore({
    upvoteCount: 0,
    createdAt: now,
    categorySeverity: 1,
    currentTime: now,
  });
  assert.ok(score > 0, 'Score should be positive based on category severity');
});

test('Edge Case: Priority score calculation with 100 upvotes and high severity', () => {
  const past = new Date(Date.now() - 5 * 24 * 3600 * 1000);
  const score = calculatePriorityScore({
    upvoteCount: 100,
    createdAt: past,
    categorySeverity: 10,
    currentTime: new Date(),
  });
  // (100 * 2.5) + (5 * 1.5) + (10 * 3.0) = 250 + 7.5 + 30 = 287.5
  assert.ok(score >= 280, `Expected score >= 280, got ${score}`);
});

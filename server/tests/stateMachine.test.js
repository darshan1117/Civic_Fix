import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStatusTransition } from '../utils/stateMachine.js';

test('State Machine: allows valid transition from Submitted to Acknowledged by officer', () => {
  const res = validateStatusTransition({
    from: 'Submitted',
    to: 'Acknowledged',
    role: 'officer',
  });
  assert.equal(res.valid, true);
});

test('State Machine: blocks invalid jump from Submitted directly to Resolved', () => {
  const res = validateStatusTransition({
    from: 'Submitted',
    to: 'Resolved',
    role: 'officer',
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /not permitted/i);
});

test('State Machine: rejects transition to Resolved if proof-of-fix photo is missing', () => {
  const res = validateStatusTransition({
    from: 'In Progress',
    to: 'Resolved',
    role: 'officer',
    proofPhotoUrl: null,
    note: 'Repairs completed by crew',
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /mandatory to resolve an issue/i);
});

test('State Machine: allows transition to Resolved when proof photo and note are provided', () => {
  const res = validateStatusTransition({
    from: 'In Progress',
    to: 'Resolved',
    role: 'officer',
    proofPhotoUrl: 'data:image/jpeg;base64,sampleproofphoto',
    note: 'Repairs completed with fresh asphalt layer.',
  });
  assert.equal(res.valid, true);
});

test('State Machine: allows citizen reporter to dispute and Reopen within 7 days', () => {
  const resolvedYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const res = validateStatusTransition({
    from: 'Resolved',
    to: 'Reopened',
    role: 'citizen',
    isReporter: true,
    resolvedAt: resolvedYesterday,
    note: 'The pothole asphalt washed away after rain.',
    currentDate: new Date(),
  });
  assert.equal(res.valid, true);
});

test('State Machine: blocks dispute/reopen if 7-day window has expired', () => {
  const resolvedTenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const res = validateStatusTransition({
    from: 'Resolved',
    to: 'Reopened',
    role: 'citizen',
    isReporter: true,
    resolvedAt: resolvedTenDaysAgo,
    note: 'Too late dispute',
    currentDate: new Date(),
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /only be disputed within 7 days/i);
});

test('State Machine: requires a reason note when rejecting an issue', () => {
  const res = validateStatusTransition({
    from: 'Submitted',
    to: 'Rejected',
    role: 'officer',
    note: '',
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /rejection reason/i);
});

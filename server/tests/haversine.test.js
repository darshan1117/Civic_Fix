import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance } from '../utils/haversine.js';

test('Haversine: distance between identical coordinates is 0 meters', () => {
  const d = calculateHaversineDistance(12.9716, 77.6412, 12.9716, 77.6412);
  assert.equal(d, 0);
});

test('Haversine: detects issues within 50 meters', () => {
  // Point A: 12.97160, 77.64120
  // Point B: ~25 meters away: 12.97180, 77.64120
  const dist = calculateHaversineDistance(12.97160, 77.64120, 12.97180, 77.64120);
  assert.ok(dist > 0 && dist < 50, `Expected dist < 50m, got ${dist}m`);
});

test('Haversine: rejects points further than 50 meters', () => {
  // Koramangala (12.9352, 77.6245) to Indiranagar (12.9716, 77.6412) is ~4.5 km
  const dist = calculateHaversineDistance(12.9352, 77.6245, 12.9716, 77.6412);
  assert.ok(dist > 1000, `Expected dist > 1000m, got ${dist}m`);
});

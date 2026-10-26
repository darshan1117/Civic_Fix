import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, findDuplicateIssues } from '../lib/haversine';
import { Issue } from '../lib/types';

describe('Haversine Distance & Duplicate Detection', () => {
  it('calculates 0 meters for identical points', () => {
    const dist = calculateHaversineDistance(12.9716, 77.5946, 12.9716, 77.5946);
    expect(dist).toBe(0);
  });

  it('accurately calculates distance between MG Road and Indiranagar (~4.7km)', () => {
    // MG Road: 12.9754, 77.6067
    // Indiranagar 100ft Rd: 12.9784, 77.6408
    const distance = calculateHaversineDistance(12.9754, 77.6067, 12.9784, 77.6408);
    // Should be around ~3700m
    expect(distance).toBeGreaterThan(3500);
    expect(distance).toBeLessThan(4000);
  });

  it('detects duplicate issues within 50 meters', () => {
    const baseLat = 12.93524;
    const baseLng = 77.62448;

    // Point ~25 meters away: 0.0002 deg lat is approx 22m
    const nearbyLat = 12.93544;
    const nearbyLng = 77.62448;

    // Point ~200 meters away
    const farLat = 12.93700;
    const farLng = 77.62448;

    const mockIssues: Issue[] = [
      {
        id: 'issue-1',
        public_id: 'CF-2026-00001',
        reporter_id: 'user-1',
        category_id: 'cat-pothole',
        department_id: 'dept-roads',
        title: 'Deep crater on road',
        description: 'Vehicles bottoming out',
        lat: nearbyLat,
        lng: nearbyLng,
        address_text: 'Koramangala 4th Block',
        status: 'Submitted',
        priority_score: 25,
        sla_deadline: new Date().toISOString(),
        escalation_level: 0,
        upvote_count: 5,
        created_at: new Date().toISOString(),
      },
      {
        id: 'issue-2',
        public_id: 'CF-2026-00002',
        reporter_id: 'user-2',
        category_id: 'cat-pothole',
        department_id: 'dept-roads',
        title: 'Farther pothole',
        description: 'Pothole down the street',
        lat: farLat,
        lng: farLng,
        address_text: 'Koramangala 4th Block',
        status: 'Acknowledged',
        priority_score: 20,
        sla_deadline: new Date().toISOString(),
        escalation_level: 0,
        upvote_count: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'issue-3',
        public_id: 'CF-2026-00003',
        reporter_id: 'user-3',
        category_id: 'cat-garbage', // Different category!
        department_id: 'dept-sanitation',
        title: 'Garbage nearby',
        description: 'Trash pile',
        lat: nearbyLat,
        lng: nearbyLng,
        address_text: 'Koramangala 4th Block',
        status: 'Submitted',
        priority_score: 15,
        sla_deadline: new Date().toISOString(),
        escalation_level: 0,
        upvote_count: 1,
        created_at: new Date().toISOString(),
      },
    ];

    const duplicates = findDuplicateIssues(
      { categoryId: 'cat-pothole', lat: baseLat, lng: baseLng },
      mockIssues,
      50
    );

    expect(duplicates.length).toBe(1);
    expect(duplicates[0].id).toBe('issue-1');
    expect(duplicates[0].distance_meters).toBeLessThan(50);
  });

  it('ignores closed and rejected issues during duplicate check', () => {
    const lat = 12.93524;
    const lng = 77.62448;

    const mockIssues: Issue[] = [
      {
        id: 'closed-issue',
        public_id: 'CF-2026-00010',
        reporter_id: 'user-1',
        category_id: 'cat-pothole',
        department_id: 'dept-roads',
        title: 'Old closed pothole',
        description: 'Fixed last month',
        lat,
        lng,
        address_text: 'Koramangala',
        status: 'Closed',
        priority_score: 10,
        sla_deadline: new Date().toISOString(),
        escalation_level: 0,
        upvote_count: 10,
        created_at: new Date().toISOString(),
      },
      {
        id: 'rejected-issue',
        public_id: 'CF-2026-00011',
        reporter_id: 'user-1',
        category_id: 'cat-pothole',
        department_id: 'dept-roads',
        title: 'Spam report',
        description: 'Not valid',
        lat,
        lng,
        address_text: 'Koramangala',
        status: 'Rejected',
        priority_score: 0,
        sla_deadline: new Date().toISOString(),
        escalation_level: 0,
        upvote_count: 0,
        created_at: new Date().toISOString(),
      },
    ];

    const duplicates = findDuplicateIssues(
      { categoryId: 'cat-pothole', lat, lng },
      mockIssues,
      50
    );

    expect(duplicates.length).toBe(0);
  });
});

import {
  Category,
  Department,
  Issue,
  IssueEvent,
  IssuePhoto,
  Notification,
  Profile,
  SLARule,
  SimilarIssue,
  IssueStatus,
  UserRole,
} from './types';
import { calculateHaversineDistance } from './haversine';
import { calculatePriorityScore } from './priority';
import { calculateSLADeadline } from './sla';
import { validateStatusTransition } from './stateMachine';
import { evaluateEscalation } from './escalation';

// Pre-seeded Departments
export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-roads',
    name: 'Roads & Infrastructure',
    code: 'ROADS',
    head_id: 'user-officer-roads',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'dept-sanitation',
    name: 'Solid Waste & Sanitation',
    code: 'SANITATION',
    head_id: 'user-officer-sanitation',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'dept-electricity',
    name: 'Electricity & Public Lighting',
    code: 'ELECTRICITY',
    head_id: 'user-officer-electricity',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'dept-water',
    name: 'Water Supply & Drainage',
    code: 'WATER',
    head_id: 'user-officer-roads',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
];

// Pre-seeded Categories
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-pothole',
    name: 'Pothole',
    department_id: 'dept-roads',
    severity_weight: 7,
    icon: 'AlertTriangle',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-garbage',
    name: 'Garbage',
    department_id: 'dept-sanitation',
    severity_weight: 6,
    icon: 'Trash2',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-streetlight',
    name: 'Streetlight',
    department_id: 'dept-electricity',
    severity_weight: 5,
    icon: 'Lightbulb',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-water',
    name: 'Water Leakage',
    department_id: 'dept-water',
    severity_weight: 9,
    icon: 'Droplets',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-drainage',
    name: 'Drainage',
    department_id: 'dept-water',
    severity_weight: 8,
    icon: 'Waves',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-other',
    name: 'Other',
    department_id: 'dept-roads',
    severity_weight: 4,
    icon: 'HelpCircle',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
];

// Pre-seeded SLA Rules (hours)
export const INITIAL_SLA_RULES: SLARule[] = [
  { id: 'sla-pothole', category_id: 'cat-pothole', sla_hours: 120, updated_at: new Date().toISOString() },
  { id: 'sla-garbage', category_id: 'cat-garbage', sla_hours: 24, updated_at: new Date().toISOString() },
  { id: 'sla-streetlight', category_id: 'cat-streetlight', sla_hours: 72, updated_at: new Date().toISOString() },
  { id: 'sla-water', category_id: 'cat-water', sla_hours: 12, updated_at: new Date().toISOString() },
  { id: 'sla-drainage', category_id: 'cat-drainage', sla_hours: 48, updated_at: new Date().toISOString() },
  { id: 'sla-other', category_id: 'cat-other', sla_hours: 72, updated_at: new Date().toISOString() },
];

// Demo Users
export const DEMO_PROFILES: (Profile & { email: string })[] = [
  {
    id: 'user-admin',
    email: 'admin@civicfix.org',
    role: 'admin',
    full_name: 'Aarav Sharma (Chief Commissioner)',
    phone: '+91 98765 00001',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'user-officer-roads',
    email: 'roads.officer@civicfix.org',
    role: 'officer',
    full_name: 'Priya Nair (Roads Officer)',
    phone: '+91 98765 00002',
    department_id: 'dept-roads',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'user-officer-sanitation',
    email: 'sanitation.officer@civicfix.org',
    role: 'officer',
    full_name: 'Rajesh Kumar (Sanitation Officer)',
    phone: '+91 98765 00003',
    department_id: 'dept-sanitation',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'user-officer-electricity',
    email: 'electricity.officer@civicfix.org',
    role: 'officer',
    full_name: 'Kavita Reddy (Power & Lighting Officer)',
    phone: '+91 98765 00004',
    department_id: 'dept-electricity',
    created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
  },
  {
    id: 'user-citizen-1',
    email: 'citizen1@civicfix.org',
    role: 'citizen',
    full_name: 'Vikram Mehta',
    phone: '+91 98765 10001',
    created_at: new Date('2026-09-10T00:00:00Z').toISOString(),
  },
  {
    id: 'user-citizen-2',
    email: 'citizen2@civicfix.org',
    role: 'citizen',
    full_name: 'Ananya Iyer',
    phone: '+91 98765 10002',
    created_at: new Date('2026-09-15T00:00:00Z').toISOString(),
  },
  {
    id: 'user-citizen-3',
    email: 'citizen3@civicfix.org',
    role: 'citizen',
    full_name: 'Rohan Gupta',
    phone: '+91 98765 10003',
    created_at: new Date('2026-09-20T00:00:00Z').toISOString(),
  },
  {
    id: 'user-citizen-4',
    email: 'citizen4@civicfix.org',
    role: 'citizen',
    full_name: 'Sneha Patel',
    phone: '+91 98765 10004',
    created_at: new Date('2026-09-25T00:00:00Z').toISOString(),
  },
  {
    id: 'user-citizen-5',
    email: 'citizen5@civicfix.org',
    role: 'citizen',
    full_name: 'Mohammed Farhan',
    phone: '+91 98765 10005',
    created_at: new Date('2026-10-01T00:00:00Z').toISOString(),
  },
];

// Helper to generate realistic Bengaluru issues
function generateInitialIssues(): Issue[] {
  const now = new Date('2026-10-27T02:00:00Z').getTime();

  const rawData: Array<{
    title: string;
    catId: string;
    deptId: string;
    lat: number;
    lng: number;
    addr: string;
    status: IssueStatus;
    ageHours: number;
    slaHours: number;
    upvotes: number;
    escalation: 0 | 1 | 2;
    photo: string;
    proof?: string;
  }> = [
    {
      title: 'Hazardous crater near Sony World Junction',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 12.9352,
      lng: 77.6245,
      addr: '100 Feet Rd, 4th Block, Koramangala',
      status: 'In Progress',
      ageHours: 48,
      slaHours: 120,
      upvotes: 18,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Uncollected commercial waste dump creating biohazard',
      catId: 'cat-garbage',
      deptId: 'dept-sanitation',
      lat: 12.9784,
      lng: 77.6408,
      addr: '12th Main, HAL 2nd Stage, Indiranagar',
      status: 'Acknowledged',
      ageHours: 32,
      slaHours: 24,
      upvotes: 27,
      escalation: 1,
      photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80',
    },
    {
      title: 'Entire stretch of streetlights dark on 14th Main',
      catId: 'cat-streetlight',
      deptId: 'dept-electricity',
      lat: 12.9121,
      lng: 77.6446,
      addr: 'Sector 1, HSR Layout near Agara Lake',
      status: 'Submitted',
      ageHours: 14,
      slaHours: 72,
      upvotes: 12,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    },
    {
      title: 'High-pressure BWSSB main pipe ruptured flooding avenue',
      catId: 'cat-water',
      deptId: 'dept-water',
      lat: 12.9754,
      lng: 77.6067,
      addr: 'Near Trinity Metro Station, MG Road',
      status: 'Submitted',
      ageHours: 18,
      slaHours: 12,
      upvotes: 39,
      escalation: 2,
      photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
    },
    {
      title: 'Severe storm water overflow blocking hospital driveway',
      catId: 'cat-drainage',
      deptId: 'dept-water',
      lat: 12.9250,
      lng: 77.5938,
      addr: '11th Main Rd, 4th Block, Jayanagar',
      status: 'Resolved',
      ageHours: 72,
      slaHours: 48,
      upvotes: 21,
      escalation: 1,
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
    {
      title: 'Damaged asphalt with exposed steel rebars',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 12.9995,
      lng: 77.5704,
      addr: 'Margosa Rd, 8th Cross, Malleshwaram',
      status: 'Closed',
      ageHours: 250,
      slaHours: 120,
      upvotes: 31,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
      proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
    {
      title: 'Dangerous deep pothole on flyover descent',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 13.0358,
      lng: 77.5970,
      addr: 'Hebbal Flyover towards Airport Road',
      status: 'In Progress',
      ageHours: 85,
      slaHours: 120,
      upvotes: 44,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Garbage heaps near school gate attracting stray animals',
      catId: 'cat-garbage',
      deptId: 'dept-sanitation',
      lat: 12.9166,
      lng: 77.6101,
      addr: '2nd Stage, BTM Layout near Kuvempu Nagar',
      status: 'In Progress',
      ageHours: 20,
      slaHours: 24,
      upvotes: 19,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80',
    },
    {
      title: 'Flickering high-mast lamp near bus depot',
      catId: 'cat-streetlight',
      deptId: 'dept-electricity',
      lat: 12.9698,
      lng: 77.7499,
      addr: 'Whitefield Main Rd opposite Forum Mall',
      status: 'Acknowledged',
      ageHours: 28,
      slaHours: 72,
      upvotes: 9,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    },
    {
      title: 'Open drain slab missing - imminent pedestrian hazard',
      catId: 'cat-drainage',
      deptId: 'dept-water',
      lat: 12.9416,
      lng: 77.5739,
      addr: 'Gandhi Bazaar Main Rd, Basavanagudi',
      status: 'Reopened',
      ageHours: 115,
      slaHours: 48,
      upvotes: 33,
      escalation: 1,
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    },
    {
      title: 'Overflowing sewer manhole onto sidewalk',
      catId: 'cat-water',
      deptId: 'dept-water',
      lat: 12.9304,
      lng: 77.6784,
      addr: 'Bellandur Outer Ring Road, Green Glen Layout',
      status: 'In Progress',
      ageHours: 11,
      slaHours: 12,
      upvotes: 22,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
    },
    {
      title: 'Fallen tree branch entangled in electric lines',
      catId: 'cat-streetlight',
      deptId: 'dept-electricity',
      lat: 12.9822,
      lng: 77.6198,
      addr: 'Kensington Rd, Ulsoor Lake side',
      status: 'Resolved',
      ageHours: 52,
      slaHours: 72,
      upvotes: 14,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
      proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
    {
      title: 'Construction rubble dumped illegally on pedestrian sidewalk',
      catId: 'cat-garbage',
      deptId: 'dept-sanitation',
      lat: 12.9972,
      lng: 77.6144,
      addr: 'Coles Road, Frazer Town',
      status: 'Rejected',
      ageHours: 96,
      slaHours: 24,
      upvotes: 4,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80',
    },
    {
      title: 'Broken concrete road divider causing head-on collisions',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 12.9569,
      lng: 77.7011,
      addr: 'Kalamandir Junction, Marathahalli',
      status: 'Submitted',
      ageHours: 8,
      slaHours: 120,
      upvotes: 11,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Sinking road foundation near bridge pillar',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 12.8452,
      lng: 77.6602,
      addr: 'Velankani Drive, Electronic City Phase 1',
      status: 'Acknowledged',
      ageHours: 42,
      slaHours: 120,
      upvotes: 19,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Continuous potable water outflow from damaged feeder valve',
      catId: 'cat-water',
      deptId: 'dept-water',
      lat: 12.9720,
      lng: 77.5950,
      addr: 'Cubbon Park Gate 2, Kasturba Rd',
      status: 'Resolved',
      ageHours: 22,
      slaHours: 12,
      upvotes: 28,
      escalation: 1,
      photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
      proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
    {
      title: 'Sanitation bin overturned blocking entry to community clinic',
      catId: 'cat-garbage',
      deptId: 'dept-sanitation',
      lat: 12.9380,
      lng: 77.6180,
      addr: '5th Block, Koramangala',
      status: 'Closed',
      ageHours: 180,
      slaHours: 24,
      upvotes: 15,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80',
      proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
    {
      title: 'Exposed live junction box near children park',
      catId: 'cat-streetlight',
      deptId: 'dept-electricity',
      lat: 12.9800,
      lng: 77.6350,
      addr: '100 Feet Rd, Indiranagar near 6th Main',
      status: 'In Progress',
      ageHours: 68,
      slaHours: 72,
      upvotes: 24,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    },
    {
      title: 'Pothole clusters along commercial market lane',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 12.9150,
      lng: 77.6400,
      addr: '27th Main Rd, HSR Sector 2',
      status: 'Submitted',
      ageHours: 135,
      slaHours: 120,
      upvotes: 37,
      escalation: 1,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Stagnant stormwater breeding mosquito larvae',
      catId: 'cat-drainage',
      deptId: 'dept-water',
      lat: 12.9220,
      lng: 77.5900,
      addr: '9th Main, Jayanagar 3rd Block',
      status: 'In Progress',
      ageHours: 39,
      slaHours: 48,
      upvotes: 16,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    },
    {
      title: 'Deep sunken manhole cover puncturing car tires',
      catId: 'cat-pothole',
      deptId: 'dept-roads',
      lat: 12.9735,
      lng: 77.6092,
      addr: 'Brigade Road, Ashok Nagar',
      status: 'Submitted',
      ageHours: 4,
      slaHours: 120,
      upvotes: 8,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Debris left behind after pipeline excavation',
      catId: 'cat-other',
      deptId: 'dept-roads',
      lat: 12.9340,
      lng: 77.6140,
      addr: '7th Block, Koramangala Industrial Layout',
      status: 'Acknowledged',
      ageHours: 35,
      slaHours: 72,
      upvotes: 6,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    },
    {
      title: 'Massive water gush from cracked conduit on flyover',
      catId: 'cat-water',
      deptId: 'dept-water',
      lat: 12.9912,
      lng: 77.5854,
      addr: 'Palace Cross Rd, Vasanth Nagar',
      status: 'In Progress',
      ageHours: 9,
      slaHours: 12,
      upvotes: 26,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
    },
    {
      title: 'Plastic waste clogging canal outflow into lake',
      catId: 'cat-garbage',
      deptId: 'dept-sanitation',
      lat: 12.9288,
      lng: 77.5812,
      addr: 'Lalbagh West Gate, Basavanagudi',
      status: 'Submitted',
      ageHours: 26,
      slaHours: 24,
      upvotes: 29,
      escalation: 1,
      photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80',
    },
    {
      title: 'Flickering and humming street lamps causing disturbance',
      catId: 'cat-streetlight',
      deptId: 'dept-electricity',
      lat: 13.0102,
      lng: 77.5550,
      addr: 'Rajajinagar 1st Block near ESI Hospital',
      status: 'Resolved',
      ageHours: 64,
      slaHours: 72,
      upvotes: 10,
      escalation: 0,
      photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
      proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    },
  ];

  const issues: Issue[] = [];

  rawData.forEach((item, index) => {
    const id = `issue-${index + 1}`;
    const public_id = `CF-2026-${String(index + 1).padStart(5, '0')}`;
    const createdAtTime = now - item.ageHours * 3600 * 1000;
    const createdAt = new Date(createdAtTime).toISOString();
    const slaDeadline = new Date(createdAtTime + item.slaHours * 3600 * 1000).toISOString();

    const cat = INITIAL_CATEGORIES.find((c) => c.id === item.catId)!;
    const dept = INITIAL_DEPARTMENTS.find((d) => d.id === item.deptId)!;
    const reporter = DEMO_PROFILES[4 + (index % 5)];

    const resolved_at =
      item.status === 'Resolved' || item.status === 'Closed'
        ? new Date(createdAtTime + 24 * 3600 * 1000).toISOString()
        : null;
    const closed_at =
      item.status === 'Closed'
        ? new Date(createdAtTime + 120 * 3600 * 1000).toISOString()
        : null;

    const photos: IssuePhoto[] = [
      {
        id: `photo-${index}-1`,
        issue_id: id,
        url: item.photo,
        kind: 'report',
        created_at: createdAt,
      },
    ];

    if (item.proof) {
      photos.push({
        id: `photo-${index}-proof`,
        issue_id: id,
        url: item.proof,
        kind: 'proof',
        created_at: resolved_at || createdAt,
      });
    }

    const events: IssueEvent[] = [
      {
        id: `event-${index}-1`,
        issue_id: id,
        actor_id: reporter.id,
        actor_name: reporter.full_name,
        actor_role: 'citizen',
        event_type: 'created',
        from_status: null,
        to_status: 'Submitted',
        note: 'Issue reported by citizen via mobile portal',
        created_at: createdAt,
      },
    ];

    if (
      item.status === 'Acknowledged' ||
      item.status === 'In Progress' ||
      item.status === 'Resolved' ||
      item.status === 'Closed' ||
      item.status === 'Reopened'
    ) {
      events.push({
        id: `event-${index}-2`,
        issue_id: id,
        actor_id: 'user-officer-roads',
        actor_name: 'Priya Nair (Roads Officer)',
        actor_role: 'officer',
        event_type: 'status_change',
        from_status: 'Submitted',
        to_status: 'Acknowledged',
        note: 'Department received report and assigned site inspection crew.',
        created_at: new Date(createdAtTime + 2 * 3600 * 1000).toISOString(),
      });
    }

    if (
      item.status === 'In Progress' ||
      item.status === 'Resolved' ||
      item.status === 'Closed' ||
      item.status === 'Reopened'
    ) {
      events.push({
        id: `event-${index}-3`,
        issue_id: id,
        actor_id: 'user-officer-roads',
        actor_name: 'Priya Nair (Roads Officer)',
        actor_role: 'officer',
        event_type: 'status_change',
        from_status: 'Acknowledged',
        to_status: 'In Progress',
        note: 'Crew deployed to the site with repair equipment and materials.',
        created_at: new Date(createdAtTime + 6 * 3600 * 1000).toISOString(),
      });
    }

    if (item.status === 'Resolved' || item.status === 'Closed') {
      events.push({
        id: `event-${index}-4`,
        issue_id: id,
        actor_id: 'user-officer-roads',
        actor_name: 'Priya Nair (Roads Officer)',
        actor_role: 'officer',
        event_type: 'status_change',
        from_status: 'In Progress',
        to_status: 'Resolved',
        note: 'Repair work finalized and verified. Proof-of-fix photo attached.',
        created_at: resolved_at!,
      });
    }

    if (item.status === 'Closed') {
      events.push({
        id: `event-${index}-5`,
        issue_id: id,
        actor_id: reporter.id,
        actor_name: reporter.full_name,
        actor_role: 'citizen',
        event_type: 'status_change',
        from_status: 'Resolved',
        to_status: 'Closed',
        note: 'Citizen confirmed satisfaction with resolution.',
        created_at: closed_at!,
      });
    }

    if (item.status === 'Rejected') {
      events.push({
        id: `event-${index}-rej`,
        issue_id: id,
        actor_id: 'user-officer-sanitation',
        actor_name: 'Rajesh Kumar (Sanitation Officer)',
        actor_role: 'officer',
        event_type: 'status_change',
        from_status: 'Submitted',
        to_status: 'Rejected',
        note: 'Private residential construction site; out of municipal jurisdiction.',
        created_at: new Date(createdAtTime + 4 * 3600 * 1000).toISOString(),
      });
    }

    if (item.status === 'Reopened') {
      events.push({
        id: `event-${index}-reopen`,
        issue_id: id,
        actor_id: reporter.id,
        actor_name: reporter.full_name,
        actor_role: 'citizen',
        event_type: 'reopened',
        from_status: 'Resolved',
        to_status: 'Reopened',
        note: 'Citizen disputed resolution: slab was poorly placed and cracked again.',
        created_at: new Date(createdAtTime + 32 * 3600 * 1000).toISOString(),
      });
    }

    if (item.escalation > 0) {
      events.push({
        id: `event-${index}-esc`,
        issue_id: id,
        actor_id: null,
        actor_name: 'System Auto-Escalation',
        actor_role: null,
        event_type: 'escalation',
        from_status: item.status,
        to_status: item.status,
        note: `SLA deadline breached. Automated Level ${item.escalation} escalation alert sent to department leadership.`,
        created_at: new Date(new Date(slaDeadline).getTime() + 60 * 1000).toISOString(),
      });
    }

    const priority_score = calculatePriorityScore({
      upvoteCount: item.upvotes,
      createdAt,
      categorySeverity: cat.severity_weight,
      currentTime: new Date(now),
    });

    issues.push({
      id,
      public_id,
      reporter_id: reporter.id,
      reporter_name: reporter.full_name,
      category_id: cat.id,
      category_name: cat.name,
      department_id: dept.id,
      department_name: dept.name,
      title: item.title,
      description:
        'Hazard reported in public space creating severe commute disruption and safety hazard for pedestrians and two-wheelers. Urgent municipal action needed.',
      lat: item.lat,
      lng: item.lng,
      address_text: item.addr,
      status: item.status,
      priority_score,
      sla_deadline: slaDeadline,
      escalation_level: item.escalation,
      upvote_count: item.upvotes,
      created_at: createdAt,
      resolved_at,
      closed_at,
      photos,
      events,
    });
  });

  return issues;
}

// In-Memory Persistent Store (singleton for active server instance)
class CivicFixStore {
  private static instance: CivicFixStore;
  public departments: Department[] = [...INITIAL_DEPARTMENTS];
  public categories: Category[] = [...INITIAL_CATEGORIES];
  public slaRules: SLARule[] = [...INITIAL_SLA_RULES];
  public profiles: (Profile & { email: string })[] = [...DEMO_PROFILES];
  public issues: Issue[] = generateInitialIssues();
  public upvotes: Array<{ issue_id: string; user_id: string; created_at: string }> = [];
  public notifications: Notification[] = [];
  private issueCounter: number = 26;

  private constructor() {
    // Generate sample notifications for the demo users
    this.notifications = [
      {
        id: 'notif-1',
        user_id: 'user-citizen-1',
        issue_id: 'issue-1',
        issue_public_id: 'CF-2026-00001',
        message: 'Your report "Hazardous crater near Sony World Junction" has moved to In Progress.',
        read: false,
        created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: 'notif-2',
        user_id: 'user-officer-roads',
        issue_id: 'issue-4',
        issue_public_id: 'CF-2026-0004',
        message: 'High priority alert: Issue CF-2026-00004 has breached SLA and reached Escalation Level 2.',
        read: false,
        created_at: new Date(Date.now() - 7200 * 1000).toISOString(),
      },
      {
        id: 'notif-3',
        user_id: 'user-citizen-2',
        issue_id: 'issue-5',
        issue_public_id: 'CF-2026-00005',
        message: 'Your report has been marked Resolved. Please review and confirm the fix.',
        read: false,
        created_at: new Date(Date.now() - 14400 * 1000).toISOString(),
      },
    ];
  }

  public static getInstance(): CivicFixStore {
    if (!CivicFixStore.instance) {
      CivicFixStore.instance = new CivicFixStore();
    }
    return CivicFixStore.instance;
  }

  // Get all issues with optional filtering
  public getIssues(filters?: {
    status?: string;
    category_id?: string;
    department_id?: string;
    overdueOnly?: boolean;
    reporter_id?: string;
    search?: string;
    sortBy?: 'priority' | 'created_at' | 'sla_deadline' | 'upvotes';
    sortOrder?: 'asc' | 'desc';
    currentUserId?: string;
  }): Issue[] {
    let result = [...this.issues];

    if (filters?.reporter_id) {
      result = result.filter((i) => i.reporter_id === filters.reporter_id);
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((i) => i.status === filters.status);
    }

    if (filters?.category_id && filters.category_id !== 'all') {
      result = result.filter((i) => i.category_id === filters.category_id);
    }

    if (filters?.department_id && filters.department_id !== 'all') {
      result = result.filter((i) => i.department_id === filters.department_id);
    }

    if (filters?.overdueOnly) {
      const now = Date.now();
      result = result.filter((i) => {
        if (i.status === 'Resolved' || i.status === 'Closed' || i.status === 'Rejected') return false;
        return new Date(i.sla_deadline).getTime() < now;
      });
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.public_id.toLowerCase().includes(q) ||
          i.address_text.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    // Annotate has_upvoted
    if (filters?.currentUserId) {
      const uid = filters.currentUserId;
      result = result.map((issue) => ({
        ...issue,
        has_upvoted: this.upvotes.some((u) => u.issue_id === issue.id && u.user_id === uid),
      }));
    }

    // Sorting
    const sortBy = filters?.sortBy || 'priority';
    const sortOrder = filters?.sortOrder || 'desc';

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        comparison = b.priority_score - a.priority_score;
      } else if (sortBy === 'created_at') {
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'sla_deadline') {
        comparison = new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime();
      } else if (sortBy === 'upvotes') {
        comparison = b.upvote_count - a.upvote_count;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }

  // Get single issue
  public getIssueById(id: string, currentUserId?: string): Issue | null {
    const issue = this.issues.find((i) => i.id === id || i.public_id === id);
    if (!issue) return null;

    const has_upvoted = currentUserId
      ? this.upvotes.some((u) => u.issue_id === issue.id && u.user_id === currentUserId)
      : false;

    return {
      ...issue,
      has_upvoted,
    };
  }

  // Duplicate detection within 50m
  public findNearbyDuplicates(
    categoryId: string,
    lat: number,
    lng: number,
    radiusMeters: number = 50
  ): SimilarIssue[] {
    const matches: SimilarIssue[] = [];

    for (const issue of this.issues) {
      if (issue.category_id !== categoryId) continue;
      if (issue.status === 'Closed' || issue.status === 'Rejected') continue;

      const dist = calculateHaversineDistance(lat, lng, issue.lat, issue.lng);
      if (dist <= radiusMeters) {
        const firstPhoto = issue.photos && issue.photos.length > 0 ? issue.photos[0].url : null;
        matches.push({
          id: issue.id,
          public_id: issue.public_id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          lat: issue.lat,
          lng: issue.lng,
          address_text: issue.address_text,
          distance_meters: Math.round(dist * 10) / 10,
          upvote_count: issue.upvote_count,
          created_at: issue.created_at,
          first_photo_url: firstPhoto,
        });
      }
    }

    return matches.sort((a, b) => a.distance_meters - b.distance_meters);
  }

  // Create Issue
  public createIssue(input: {
    title: string;
    description: string;
    category_id: string;
    lat: number;
    lng: number;
    address_text: string;
    photos: string[];
    reporter_id: string;
    reporter_name?: string;
  }): Issue {
    const category = this.categories.find((c) => c.id === input.category_id);
    if (!category) throw new Error('Invalid category selected.');

    const department = this.departments.find((d) => d.id === category.department_id);
    if (!department) throw new Error('Department not found for category.');

    const slaRule = this.slaRules.find((s) => s.category_id === category.id);
    const slaHours = slaRule ? slaRule.sla_hours : 48;

    const now = new Date();
    const slaDeadline = calculateSLADeadline(now, slaHours);

    this.issueCounter += 1;
    const newId = `issue-${Date.now()}`;
    const publicId = `CF-2026-${String(this.issueCounter).padStart(5, '0')}`;

    const priorityScore = calculatePriorityScore({
      upvoteCount: 0,
      createdAt: now,
      categorySeverity: category.severity_weight,
      currentTime: now,
    });

    const issuePhotos: IssuePhoto[] = input.photos.map((url, i) => ({
      id: `photo-${Date.now()}-${i}`,
      issue_id: newId,
      url,
      kind: 'report',
      created_at: now.toISOString(),
    }));

    const firstEvent: IssueEvent = {
      id: `event-${Date.now()}-1`,
      issue_id: newId,
      actor_id: input.reporter_id,
      actor_name: input.reporter_name || 'Citizen Reporter',
      actor_role: 'citizen',
      event_type: 'created',
      from_status: null,
      to_status: 'Submitted',
      note: 'Issue officially reported and assigned to ' + department.name,
      created_at: now.toISOString(),
    };

    const newIssue: Issue[] = [
      {
        id: newId,
        public_id: publicId,
        reporter_id: input.reporter_id,
        reporter_name: input.reporter_name || 'Citizen Reporter',
        category_id: category.id,
        category_name: category.name,
        department_id: department.id,
        department_name: department.name,
        title: input.title,
        description: input.description,
        lat: input.lat,
        lng: input.lng,
        address_text: input.address_text,
        status: 'Submitted',
        priority_score: priorityScore,
        sla_deadline: slaDeadline.toISOString(),
        escalation_level: 0,
        upvote_count: 0,
        created_at: now.toISOString(),
        photos: issuePhotos,
        events: [firstEvent],
      },
    ];

    this.issues = [...newIssue, ...this.issues];

    // Create notification for citizen
    this.createNotification({
      user_id: input.reporter_id,
      issue_id: newId,
      issue_public_id: publicId,
      message: `Your issue ${publicId} has been submitted successfully to ${department.name}.`,
    });

    return this.issues[0];
  }

  // Upvote Issue (Strict 1 per user)
  public toggleUpvote(issueId: string, userId: string): { success: boolean; hasUpvoted: boolean; upvoteCount: number; error?: string } {
    const issue = this.issues.find((i) => i.id === issueId || i.public_id === issueId);
    if (!issue) return { success: false, hasUpvoted: false, upvoteCount: 0, error: 'Issue not found.' };

    const existingIndex = this.upvotes.findIndex(
      (u) => u.issue_id === issue.id && u.user_id === userId
    );

    if (existingIndex >= 0) {
      // Remove upvote
      this.upvotes.splice(existingIndex, 1);
      issue.upvote_count = Math.max(0, issue.upvote_count - 1);
    } else {
      // Add upvote
      this.upvotes.push({
        issue_id: issue.id,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      issue.upvote_count += 1;
    }

    // Recompute priority score
    const category = this.categories.find((c) => c.id === issue.category_id);
    const sev = category ? category.severity_weight : 5;
    issue.priority_score = calculatePriorityScore({
      upvoteCount: issue.upvote_count,
      createdAt: issue.created_at,
      categorySeverity: sev,
    });

    const hasUpvoted = existingIndex < 0;
    return {
      success: true,
      hasUpvoted,
      upvoteCount: issue.upvote_count,
    };
  }

  // Update Status with State Machine enforcement
  public updateIssueStatus(params: {
    issueId: string;
    toStatus: IssueStatus;
    actor: Profile;
    note?: string;
    proofPhotoUrl?: string;
  }): { success: boolean; issue?: Issue; error?: string } {
    const issue = this.issues.find((i) => i.id === params.issueId || i.public_id === params.issueId);
    if (!issue) return { success: false, error: 'Issue not found.' };

    const isReporter = issue.reporter_id === params.actor.id;

    // Validate using pure state machine
    const validation = validateStatusTransition({
      from: issue.status,
      to: params.toStatus,
      role: params.actor.role,
      isReporter,
      note: params.note,
      proofPhotoUrl: params.proofPhotoUrl,
      resolvedAt: issue.resolved_at,
      currentDate: new Date(),
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const now = new Date().toISOString();
    const fromStatus = issue.status;
    issue.status = params.toStatus;

    if (params.toStatus === 'Resolved') {
      issue.resolved_at = now;
      if (params.proofPhotoUrl) {
        issue.photos = issue.photos || [];
        issue.photos.push({
          id: `photo-proof-${Date.now()}`,
          issue_id: issue.id,
          url: params.proofPhotoUrl,
          kind: 'proof',
          created_at: now,
        });
      }
    } else if (params.toStatus === 'Closed') {
      issue.closed_at = now;
    }

    // Append event
    const newEvent: IssueEvent = {
      id: `event-${Date.now()}`,
      issue_id: issue.id,
      actor_id: params.actor.id,
      actor_name: params.actor.full_name,
      actor_role: params.actor.role,
      event_type: params.toStatus === 'Reopened' ? 'reopened' : 'status_change',
      from_status: fromStatus,
      to_status: params.toStatus,
      note: params.note || `Status transitioned to ${params.toStatus}`,
      created_at: now,
    };

    issue.events = issue.events || [];
    issue.events.push(newEvent);

    // Notify citizen reporter
    this.createNotification({
      user_id: issue.reporter_id,
      issue_id: issue.id,
      issue_public_id: issue.public_id,
      message: `Issue ${issue.public_id} updated: changed from ${fromStatus} to ${params.toStatus}.`,
    });

    return { success: true, issue };
  }

  // Auto-escalation batch job
  public runEscalationJob(): {
    escalatedCount: number;
    details: Array<{ issue_id: string; public_id: string; oldLevel: number; newLevel: number }>;
  } {
    const now = new Date();
    const details: Array<{ issue_id: string; public_id: string; oldLevel: number; newLevel: number }> = [];

    for (const issue of this.issues) {
      const decision = evaluateEscalation(issue, now);
      if (decision.shouldEscalate && decision.newLevel !== undefined) {
        const oldLevel = issue.escalation_level;
        issue.escalation_level = decision.newLevel;

        const eventNote = decision.reason || `Automated SLA Escalation to Level ${decision.newLevel}.`;
        const newEvent: IssueEvent = {
          id: `event-esc-${Date.now()}-${issue.id}`,
          issue_id: issue.id,
          actor_id: null,
          actor_name: 'Automated SLA Escalator',
          actor_role: null,
          event_type: 'escalation',
          from_status: issue.status,
          to_status: issue.status,
          note: eventNote,
          created_at: now.toISOString(),
        };

        issue.events = issue.events || [];
        issue.events.push(newEvent);

        // Notify department head or admin
        const targetUserId =
          decision.targetRole === 'department_head'
            ? this.departments.find((d) => d.id === issue.department_id)?.head_id || 'user-officer-roads'
            : 'user-admin';

        this.createNotification({
          user_id: targetUserId,
          issue_id: issue.id,
          issue_public_id: issue.public_id,
          message: `🚨 ESCALATION ALERT: Issue ${issue.public_id} (${issue.title}) is overdue and escalated to Level ${decision.newLevel}.`,
        });

        details.push({
          issue_id: issue.id,
          public_id: issue.public_id,
          oldLevel,
          newLevel: decision.newLevel,
        });
      }
    }

    return {
      escalatedCount: details.length,
      details,
    };
  }

  // SLA Rule Editor (Admin only)
  public updateSLARule(categoryId: string, slaHours: number): SLARule | null {
    const rule = this.slaRules.find((r) => r.category_id === categoryId);
    if (!rule) return null;

    rule.sla_hours = slaHours;
    rule.updated_at = new Date().toISOString();
    return rule;
  }

  // Notifications
  public getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.user_id === userId) n.read = true;
    });
  }

  public createNotification(input: {
    user_id: string;
    issue_id: string;
    issue_public_id?: string;
    message: string;
  }): Notification {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: input.user_id,
      issue_id: input.issue_id,
      issue_public_id: input.issue_public_id,
      message: input.message,
      read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }

  // Profile lookup
  public getProfileByEmail(email: string): (Profile & { email: string }) | null {
    return this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getProfileById(id: string): (Profile & { email: string }) | null {
    return this.profiles.find((p) => p.id === id) || null;
  }
}

export const dataStore = CivicFixStore.getInstance();

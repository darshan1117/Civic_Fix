import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { SLARule } from '../models/SLARule.js';
import { Issue } from '../models/Issue.js';
import { Notification } from '../models/Notification.js';
import { calculatePriorityScore } from '../utils/priority.js';
import { calculateSLADeadline } from '../utils/sla.js';

export async function seedDatabaseIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // already seeded

    console.log('[Seeder] Populating database with realistic Bengaluru civic dataset...');

    // 1. Departments
    const depts = await Department.create([
      { name: 'Roads & Infrastructure', code: 'ROADS' },
      { name: 'Solid Waste & Sanitation', code: 'SANITATION' },
      { name: 'Electricity & Public Lighting', code: 'ELECTRICITY' },
      { name: 'Water Supply & Drainage', code: 'WATER' },
    ]);

    // 2. Users
    const admin = await User.create({
      name: 'Aarav Sharma (Chief Commissioner)',
      email: 'admin@civicfix.org',
      password: 'Password123!',
      role: 'admin',
      phone: '+91 98765 00001',
    });

    const officerRoads = await User.create({
      name: 'Priya Nair (Roads Officer)',
      email: 'roads.officer@civicfix.org',
      password: 'Password123!',
      role: 'officer',
      department: depts[0]._id,
      phone: '+91 98765 00002',
    });

    const officerSanitation = await User.create({
      name: 'Rajesh Kumar (Sanitation Officer)',
      email: 'sanitation.officer@civicfix.org',
      password: 'Password123!',
      role: 'officer',
      department: depts[1]._id,
      phone: '+91 98765 00003',
    });

    const officerElectricity = await User.create({
      name: 'Kavita Reddy (Power Officer)',
      email: 'electricity.officer@civicfix.org',
      password: 'Password123!',
      role: 'officer',
      department: depts[2]._id,
      phone: '+91 98765 00004',
    });

    // Link heads
    depts[0].head = officerRoads._id;
    depts[1].head = officerSanitation._id;
    depts[2].head = officerElectricity._id;
    await depts[0].save();
    await depts[1].save();
    await depts[2].save();

    const citizens = await User.create([
      { name: 'Vikram Mehta', email: 'citizen1@civicfix.org', password: 'Password123!', role: 'citizen', phone: '+91 98765 10001' },
      { name: 'Ananya Iyer', email: 'citizen2@civicfix.org', password: 'Password123!', role: 'citizen', phone: '+91 98765 10002' },
      { name: 'Rohan Gupta', email: 'citizen3@civicfix.org', password: 'Password123!', role: 'citizen', phone: '+91 98765 10003' },
      { name: 'Sneha Patel', email: 'citizen4@civicfix.org', password: 'Password123!', role: 'citizen', phone: '+91 98765 10004' },
      { name: 'Mohammed Farhan', email: 'citizen5@civicfix.org', password: 'Password123!', role: 'citizen', phone: '+91 98765 10005' },
    ]);

    // 3. Categories & SLA Rules
    const categories = await Category.create([
      { name: 'Pothole', department: depts[0]._id, severityWeight: 7, defaultSlaHours: 120, icon: 'AlertTriangle' },
      { name: 'Garbage', department: depts[1]._id, severityWeight: 6, defaultSlaHours: 24, icon: 'Trash2' },
      { name: 'Streetlight', department: depts[2]._id, severityWeight: 5, defaultSlaHours: 72, icon: 'Lightbulb' },
      { name: 'Water Leakage', department: depts[3]._id, severityWeight: 9, defaultSlaHours: 12, icon: 'Droplets' },
      { name: 'Drainage', department: depts[3]._id, severityWeight: 8, defaultSlaHours: 48, icon: 'Waves' },
      { name: 'Other', department: depts[0]._id, severityWeight: 4, defaultSlaHours: 72, icon: 'HelpCircle' },
    ]);

    for (const cat of categories) {
      await SLARule.create({ category: cat._id, slaHours: cat.defaultSlaHours });
    }

    // 4. Realistic Bengaluru Issues
    const rawIssues = [
      { title: 'Hazardous crater near Sony World Junction', catIdx: 0, deptIdx: 0, lat: 12.9352, lng: 77.6245, addr: '100 Feet Rd, 4th Block, Koramangala', status: 'In Progress', ageH: 48, slaH: 120, upvotes: 18, esc: 0, photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80' },
      { title: 'Uncollected commercial waste dump creating biohazard', catIdx: 1, deptIdx: 1, lat: 12.9784, lng: 77.6408, addr: '12th Main, HAL 2nd Stage, Indiranagar', status: 'Acknowledged', ageH: 32, slaH: 24, upvotes: 27, esc: 1, photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80' },
      { title: 'Entire stretch of streetlights dark on 14th Main', catIdx: 2, deptIdx: 2, lat: 12.9121, lng: 77.6446, addr: 'Sector 1, HSR Layout near Agara Lake', status: 'Submitted', ageH: 14, slaH: 72, upvotes: 12, esc: 0, photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
      { title: 'High-pressure BWSSB main pipe ruptured flooding avenue', catIdx: 3, deptIdx: 3, lat: 12.9754, lng: 77.6067, addr: 'Near Trinity Metro Station, MG Road', status: 'Submitted', ageH: 18, slaH: 12, upvotes: 39, esc: 2, photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80' },
      { title: 'Severe storm water overflow blocking hospital driveway', catIdx: 4, deptIdx: 3, lat: 12.9250, lng: 77.5938, addr: '11th Main Rd, 4th Block, Jayanagar', status: 'Resolved', ageH: 72, slaH: 48, upvotes: 21, esc: 1, photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80' },
      { title: 'Damaged asphalt with exposed steel rebars', catIdx: 0, deptIdx: 0, lat: 12.9995, lng: 77.5704, addr: 'Margosa Rd, 8th Cross, Malleshwaram', status: 'Closed', ageH: 250, slaH: 120, upvotes: 31, esc: 0, photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80', proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80' },
      { title: 'Dangerous deep pothole on flyover descent', catIdx: 0, deptIdx: 0, lat: 13.0358, lng: 77.5970, addr: 'Hebbal Flyover towards Airport Road', status: 'In Progress', ageH: 85, slaH: 120, upvotes: 44, esc: 0, photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80' },
      { title: 'Garbage heaps near school gate attracting stray animals', catIdx: 1, deptIdx: 1, lat: 12.9166, lng: 77.6101, addr: '2nd Stage, BTM Layout near Kuvempu Nagar', status: 'In Progress', ageH: 20, slaH: 24, upvotes: 19, esc: 0, photo: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80' },
      { title: 'Flickering high-mast lamp near bus depot', catIdx: 2, deptIdx: 2, lat: 12.9698, lng: 77.7499, addr: 'Whitefield Main Rd opposite Forum Mall', status: 'Acknowledged', ageH: 28, slaH: 72, upvotes: 9, esc: 0, photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
      { title: 'Open drain slab missing - imminent pedestrian hazard', catIdx: 4, deptIdx: 3, lat: 12.9416, lng: 77.5739, addr: 'Gandhi Bazaar Main Rd, Basavanagudi', status: 'Reopened', ageH: 115, slaH: 48, upvotes: 33, esc: 1, photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
      { title: 'Overflowing sewer manhole onto sidewalk', catIdx: 3, deptIdx: 3, lat: 12.9304, lng: 77.6784, addr: 'Bellandur Outer Ring Road, Green Glen Layout', status: 'In Progress', ageH: 11, slaH: 12, upvotes: 22, esc: 0, photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80' },
      { title: 'Fallen tree branch entangled in electric lines', catIdx: 2, deptIdx: 2, lat: 12.9822, lng: 77.6198, addr: 'Kensington Rd, Ulsoor Lake side', status: 'Resolved', ageH: 52, slaH: 72, upvotes: 14, esc: 0, photo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', proof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80' },
    ];

    const now = Date.now();
    for (let i = 0; i < rawIssues.length; i++) {
      const item = rawIssues[i];
      const created = new Date(now - item.ageH * 3600 * 1000);
      const deadline = new Date(created.getTime() + item.slaH * 3600 * 1000);
      const reporter = citizens[i % citizens.length];
      const cat = categories[item.catIdx];
      const dept = depts[item.deptIdx];

      const photos = [{ url: item.photo, kind: 'report', createdAt: created }];
      if (item.proof) {
        photos.push({ url: item.proof, kind: 'proof', createdAt: new Date(created.getTime() + 20 * 3600 * 1000) });
      }

      const events = [
        {
          actor: reporter._id,
          actorName: reporter.name,
          actorRole: 'citizen',
          eventType: 'created',
          fromStatus: null,
          toStatus: 'Submitted',
          note: 'Issue reported by citizen via mobile portal',
          createdAt: created,
        },
      ];

      if (['Acknowledged', 'In Progress', 'Resolved', 'Closed', 'Reopened'].includes(item.status)) {
        events.push({
          actor: officerRoads._id,
          actorName: officerRoads.name,
          actorRole: 'officer',
          eventType: 'status_change',
          fromStatus: 'Submitted',
          toStatus: 'Acknowledged',
          note: 'Department received report and assigned site inspection crew.',
          createdAt: new Date(created.getTime() + 2 * 3600 * 1000),
        });
      }

      if (['In Progress', 'Resolved', 'Closed', 'Reopened'].includes(item.status)) {
        events.push({
          actor: officerRoads._id,
          actorName: officerRoads.name,
          actorRole: 'officer',
          eventType: 'status_change',
          fromStatus: 'Acknowledged',
          toStatus: 'In Progress',
          note: 'Crew deployed to the site with repair equipment.',
          createdAt: new Date(created.getTime() + 6 * 3600 * 1000),
        });
      }

      if (['Resolved', 'Closed'].includes(item.status)) {
        events.push({
          actor: officerRoads._id,
          actorName: officerRoads.name,
          actorRole: 'officer',
          eventType: 'status_change',
          fromStatus: 'In Progress',
          toStatus: 'Resolved',
          note: 'Repair work finalized and verified. Proof-of-fix photo attached.',
          createdAt: new Date(created.getTime() + 24 * 3600 * 1000),
        });
      }

      if (item.status === 'Closed') {
        events.push({
          actor: reporter._id,
          actorName: reporter.name,
          actorRole: 'citizen',
          eventType: 'status_change',
          fromStatus: 'Resolved',
          toStatus: 'Closed',
          note: 'Citizen confirmed satisfaction with resolution.',
          createdAt: new Date(created.getTime() + 120 * 3600 * 1000),
        });
      }

      if (item.esc > 0) {
        events.push({
          actor: null,
          actorName: 'System Auto-Escalation Engine',
          actorRole: 'system',
          eventType: 'escalation',
          fromStatus: item.status,
          toStatus: item.status,
          note: `SLA deadline breached. Automated Level ${item.esc} escalation alert sent.`,
          createdAt: new Date(deadline.getTime() + 60 * 1000),
        });
      }

      const priority_score = calculatePriorityScore({
        upvoteCount: item.upvotes,
        createdAt: created,
        categorySeverity: cat.severityWeight,
      });

      await Issue.create({
        public_id: `CF-2026-${String(i + 1).padStart(5, '0')}`,
        reporter: reporter._id,
        category: cat._id,
        department: dept._id,
        title: item.title,
        description: 'Hazard reported in public space creating severe commute disruption and safety hazard. Immediate municipal intervention requested.',
        lat: item.lat,
        lng: item.lng,
        address_text: item.addr,
        status: item.status,
        priority_score,
        sla_deadline: deadline,
        escalation_level: item.esc,
        upvotes: [],
        upvote_count: item.upvotes,
        photos,
        events,
        resolved_at: ['Resolved', 'Closed'].includes(item.status) ? new Date(created.getTime() + 24 * 3600 * 1000) : null,
        closed_at: item.status === 'Closed' ? new Date(created.getTime() + 120 * 3600 * 1000) : null,
        createdAt: created,
      });
    }

    console.log('[Seeder] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seeder Error]:', error);
  }
}

-- CivicFix Seed Data
-- 1 Admin, 3 Departments, 3 Officers, 5 Citizens, SLA Rules, and ~40 realistic Bengaluru Issues

-- 1. Insert Departments
INSERT INTO departments (id, name, code, created_at) VALUES
('11111111-1111-1111-1111-111111111101', 'Roads & Infrastructure', 'ROADS', NOW()),
('11111111-1111-1111-1111-111111111102', 'Solid Waste & Sanitation', 'SANITATION', NOW()),
('11111111-1111-1111-1111-111111111103', 'Electricity & Public Lighting', 'ELECTRICITY', NOW()),
('11111111-1111-1111-1111-111111111104', 'Water Supply & Drainage', 'WATER', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Categories
INSERT INTO categories (id, name, department_id, severity_weight, icon, created_at) VALUES
('22222222-2222-2222-2222-222222222201', 'Pothole', '11111111-1111-1111-1111-111111111101', 7, 'AlertTriangle', NOW()),
('22222222-2222-2222-2222-222222222202', 'Garbage', '11111111-1111-1111-1111-111111111102', 6, 'Trash2', NOW()),
('22222222-2222-2222-2222-222222222203', 'Streetlight', '11111111-1111-1111-1111-111111111103', 5, 'Lightbulb', NOW()),
('22222222-2222-2222-2222-222222222204', 'Water Leakage', '11111111-1111-1111-1111-111111111104', 9, 'Droplets', NOW()),
('22222222-2222-2222-2222-222222222205', 'Drainage', '11111111-1111-1111-1111-111111111104', 8, 'Waves', NOW()),
('22222222-2222-2222-2222-222222222206', 'Other', '11111111-1111-1111-1111-111111111101', 4, 'HelpCircle', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert SLA Rules (Hours)
INSERT INTO sla_rules (id, category_id, sla_hours, updated_at) VALUES
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 120, NOW()), -- Pothole: 5 days
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 24, NOW()),  -- Garbage: 24h
('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', 72, NOW()),  -- Streetlight: 72h
('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222204', 12, NOW()),  -- Water Leakage: 12h
('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222205', 48, NOW()),  -- Drainage: 48h
('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222206', 72, NOW())   -- Other: 72h
ON CONFLICT (category_id) DO NOTHING;

-- 4. Insert Demo Users in auth.users and profiles
-- Password hash for 'Password123!': '$2a$10$wN4h1HhL08j3HupEa7q4u.Jc4Z.9f3sR7bVzQ5zF4k1G.9wH6rG6i' or created via Supabase auth API.
-- In development / demo seeds, we populate public.profiles directly with known UUIDs.

INSERT INTO profiles (id, role, full_name, phone, department_id, created_at) VALUES
('44444444-4444-4444-4444-444444444401', 'admin', 'Aarav Sharma (Chief Commissioner)', '+91 98765 00001', NULL, NOW() - INTERVAL '30 days'),
('44444444-4444-4444-4444-444444444402', 'officer', 'Priya Nair (Roads Officer)', '+91 98765 00002', '11111111-1111-1111-1111-111111111101', NOW() - INTERVAL '30 days'),
('44444444-4444-4444-4444-444444444403', 'officer', 'Rajesh Kumar (Sanitation Officer)', '+91 98765 00003', '11111111-1111-1111-1111-111111111102', NOW() - INTERVAL '30 days'),
('44444444-4444-4444-4444-444444444404', 'officer', 'Kavita Reddy (Power & Lighting Officer)', '+91 98765 00004', '11111111-1111-1111-1111-111111111103', NOW() - INTERVAL '30 days'),
('44444444-4444-4444-4444-444444444405', 'citizen', 'Vikram Mehta', '+91 98765 10001', NULL, NOW() - INTERVAL '25 days'),
('44444444-4444-4444-4444-444444444406', 'citizen', 'Ananya Iyer', '+91 98765 10002', NULL, NOW() - INTERVAL '20 days'),
('44444444-4444-4444-4444-444444444407', 'citizen', 'Rohan Gupta', '+91 98765 10003', NULL, NOW() - INTERVAL '15 days'),
('44444444-4444-4444-4444-444444444408', 'citizen', 'Sneha Patel', '+91 98765 10004', NULL, NOW() - INTERVAL '10 days'),
('44444444-4444-4444-4444-444444444409', 'citizen', 'Mohammed Farhan', '+91 98765 10005', NULL, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  department_id = EXCLUDED.department_id;

-- Link department heads
UPDATE departments SET head_id = '44444444-4444-4444-4444-444444444402' WHERE id = '11111111-1111-1111-1111-111111111101';
UPDATE departments SET head_id = '44444444-4444-4444-4444-444444444403' WHERE id = '11111111-1111-1111-1111-111111111102';
UPDATE departments SET head_id = '44444444-4444-4444-4444-444444444404' WHERE id = '11111111-1111-1111-1111-111111111103';

-- 5. Helper function to seed issues with events & photos cleanly
DO $$
DECLARE
  v_issues JSONB := '[
    {"title": "Hazardous crater near Sony World Junction", "cat": "22222222-2222-2222-2222-222222222201", "dept": "11111111-1111-1111-1111-111111111101", "lat": 12.9352, "lng": 77.6245, "addr": "100 Feet Rd, 4th Block, Koramangala", "status": "In Progress", "age_h": 48, "sla_h": 120, "upvotes": 14, "escalation": 0, "photo": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"},
    {"title": "Uncollected commercial waste dump creating biohazard", "cat": "22222222-2222-2222-2222-222222222202", "dept": "11111111-1111-1111-1111-111111111102", "lat": 12.9784, "lng": 77.6408, "addr": "12th Main, HAL 2nd Stage, Indiranagar", "status": "Acknowledged", "age_h": 30, "sla_h": 24, "upvotes": 22, "escalation": 1, "photo": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80"},
    {"title": "Entire stretch of streetlights dark on 14th Main", "cat": "22222222-2222-2222-2222-222222222203", "dept": "11111111-1111-1111-1111-111111111103", "lat": 12.9121, "lng": 77.6446, "addr": "Sector 1, HSR Layout near Agara Lake", "status": "Submitted", "age_h": 12, "sla_h": 72, "upvotes": 8, "escalation": 0, "photo": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80"},
    {"title": "High-pressure BWSSB main pipe ruptured flooding avenue", "cat": "22222222-2222-2222-2222-222222222204", "dept": "11111111-1111-1111-1111-111111111104", "lat": 12.9754, "lng": 77.6067, "addr": "Near Trinity Metro, MG Road", "status": "Submitted", "age_h": 16, "sla_h": 12, "upvotes": 35, "escalation": 2, "photo": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80"},
    {"title": "Severe storm water overflow blocking hospital driveway", "cat": "22222222-2222-2222-2222-222222222205", "dept": "11111111-1111-1111-1111-111111111104", "lat": 12.9250, "lng": 77.5938, "addr": "11th Main Rd, 4th Block, Jayanagar", "status": "Resolved", "age_h": 70, "sla_h": 48, "upvotes": 19, "escalation": 1, "photo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80", "proof": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"},
    {"title": "Damaged asphalt with exposed steel rebars", "cat": "22222222-2222-2222-2222-222222222201", "dept": "11111111-1111-1111-1111-111111111101", "lat": 12.9995, "lng": 77.5704, "addr": "Margosa Rd, 8th Cross, Malleshwaram", "status": "Closed", "age_h": 240, "sla_h": 120, "upvotes": 27, "escalation": 0, "photo": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80", "proof": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"},
    {"title": "Dangerous deep pothole on flyover descent", "cat": "22222222-2222-2222-2222-222222222201", "dept": "11111111-1111-1111-1111-111111111101", "lat": 13.0358, "lng": 77.5970, "addr": "Hebbal Flyover towards Airport Road", "status": "In Progress", "age_h": 80, "sla_h": 120, "upvotes": 41, "escalation": 0, "photo": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"},
    {"title": "Garbage heaps near school gate attracting stray animals", "cat": "22222222-2222-2222-2222-222222222202", "dept": "11111111-1111-1111-1111-111111111102", "lat": 12.9166, "lng": 77.6101, "addr": "2nd Stage, BTM Layout near Kuvempu Nagar", "status": "In Progress", "age_h": 18, "sla_h": 24, "upvotes": 15, "escalation": 0, "photo": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80"},
    {"title": "Flickering high-mast lamp near bus depot", "cat": "22222222-2222-2222-2222-222222222203", "dept": "11111111-1111-1111-1111-111111111103", "lat": 12.9698, "lng": 77.7499, "addr": "Whitefield Main Rd opposite Forum Mall", "status": "Acknowledged", "age_h": 26, "sla_h": 72, "upvotes": 7, "escalation": 0, "photo": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80"},
    {"title": "Open drain slab missing - imminent pedestrian hazard", "cat": "22222222-2222-2222-2222-222222222205", "dept": "11111111-1111-1111-1111-111111111104", "lat": 12.9416, "lng": 77.5739, "addr": "Gandhi Bazaar Main Rd, Basavanagudi", "status": "Reopened", "age_h": 110, "sla_h": 48, "upvotes": 29, "escalation": 1, "photo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"},
    {"title": "Overflowing sewer manhole onto sidewalk", "cat": "22222222-2222-2222-2222-222222222204", "dept": "11111111-1111-1111-1111-111111111104", "lat": 12.9304, "lng": 77.6784, "addr": "Bellandur Outer Ring Road, Green Glen Layout", "status": "In Progress", "age_h": 10, "sla_h": 12, "upvotes": 18, "escalation": 0, "photo": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80"},
    {"title": "Fallen tree branch blocking electric lines", "cat": "22222222-2222-2222-2222-222222222203", "dept": "11111111-1111-1111-1111-111111111103", "lat": 12.9822, "lng": 77.6198, "addr": "Kensington Rd, Ulsoor Lake side", "status": "Resolved", "age_h": 50, "sla_h": 72, "upvotes": 12, "escalation": 0, "photo": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80", "proof": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"},
    {"title": "Debris dumped on pedestrian walkway", "cat": "22222222-2222-2222-2222-222222222202", "dept": "11111111-1111-1111-1111-111111111102", "lat": 12.9972, "lng": 77.6144, "addr": "Coles Road, Frazer Town", "status": "Rejected", "age_h": 90, "sla_h": 24, "upvotes": 3, "escalation": 0, "photo": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80"},
    {"title": "Broken traffic divider causing lane encroachment", "cat": "22222222-2222-2222-2222-222222222201", "dept": "11111111-1111-1111-1111-111111111101", "lat": 12.9569, "lng": 77.7011, "addr": "Kalamandir Junction, Marathahalli", "status": "Submitted", "age_h": 6, "sla_h": 120, "upvotes": 9, "escalation": 0, "photo": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"},
    {"title": "Sinking road foundation near bridge pillar", "cat": "22222222-2222-2222-2222-222222222201", "dept": "11111111-1111-1111-1111-111111111101", "lat": 12.8452, "lng": 77.6602, "addr": "Velankani Drive, Electronic City Phase 1", "status": "Acknowledged", "age_h": 40, "sla_h": 120, "upvotes": 16, "escalation": 0, "photo": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"},
    {"title": "Continuous water outflow from subterranean pipeline", "cat": "22222222-2222-2222-2222-222222222204", "dept": "11111111-1111-1111-1111-111111111104", "lat": 12.9720, "lng": 77.5950, "addr": "Cubbon Park Gate 2, Kasturba Rd", "status": "Resolved", "age_h": 18, "sla_h": 12, "upvotes": 25, "escalation": 1, "photo": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80", "proof": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"},
    {"title": "Dead animal remains not cleared for 2 days", "cat": "22222222-2222-2222-2222-222222222202", "dept": "11111111-1111-1111-1111-111111111102", "lat": 12.9380, "lng": 77.6180, "addr": "5th Block, Koramangala", "status": "Closed", "age_h": 160, "sla_h": 24, "upvotes": 11, "escalation": 0, "photo": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&q=80", "proof": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"},
    {"title": "Broken street lamp post hanging precariously", "cat": "22222222-2222-2222-2222-222222222203", "dept": "11111111-1111-1111-1111-111111111103", "lat": 12.9800, "lng": 77.6350, "addr": "100 Feet Rd, Indiranagar near 6th Main", "status": "In Progress", "age_h": 65, "sla_h": 72, "upvotes": 21, "escalation": 0, "photo": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80"},
    {"title": "Pothole clusters damaging two-wheelers daily", "cat": "22222222-2222-2222-2222-222222222201", "dept": "11111111-1111-1111-1111-111111111101", "lat": 12.9150, "lng": 77.6400, "addr": "27th Main Rd, HSR Sector 2", "status": "Submitted", "age_h": 130, "sla_h": 120, "upvotes": 32, "escalation": 1, "photo": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"},
    {"title": "Stagnant stormwater breeding mosquito larvae", "cat": "22222222-2222-2222-2222-222222222205", "dept": "11111111-1111-1111-1111-111111111104", "lat": 12.9220, "lng": 77.5900, "addr": "9th Main, Jayanagar 3rd Block", "status": "In Progress", "age_h": 36, "sla_h": 48, "upvotes": 14, "escalation": 0, "photo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"}
  ]';
  item JSONB;
  v_issue_id UUID;
  v_reporter_id UUID;
  v_created TIMESTAMPTZ;
  v_deadline TIMESTAMPTZ;
  v_resolved TIMESTAMPTZ;
  v_closed TIMESTAMPTZ;
  v_reporters UUID[] := ARRAY[
    '44444444-4444-4444-4444-444444444405'::UUID,
    '44444444-4444-4444-4444-444444444406'::UUID,
    '44444444-4444-4444-4444-444444444407'::UUID,
    '44444444-4444-4444-4444-444444444408'::UUID,
    '44444444-4444-4444-4444-444444444409'::UUID
  ];
  idx INT := 1;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(v_issues) LOOP
    v_created := NOW() - ((item->>'age_h')::INT || ' hours')::INTERVAL;
    v_deadline := v_created + ((item->>'sla_h')::INT || ' hours')::INTERVAL;
    v_reporter_id := v_reporters[1 + (idx % 5)];
    
    v_resolved := CASE WHEN (item->>'status') IN ('Resolved', 'Closed') THEN v_created + INTERVAL '24 hours' ELSE NULL END;
    v_closed := CASE WHEN (item->>'status') = 'Closed' THEN v_created + INTERVAL '120 hours' ELSE NULL END;

    INSERT INTO issues (
      id,
      public_id,
      reporter_id,
      category_id,
      department_id,
      title,
      description,
      lat,
      lng,
      address_text,
      status,
      priority_score,
      sla_deadline,
      escalation_level,
      upvote_count,
      created_at,
      resolved_at,
      closed_at
    ) VALUES (
      gen_random_uuid(),
      'CF-2026-' || LPAD(idx::TEXT, 5, '0'),
      v_reporter_id,
      (item->>'cat')::UUID,
      (item->>'dept')::UUID,
      item->>'title',
      'Citizen reported civic hazard causing severe inconvenience and risk to public safety. Immediate municipal intervention requested.',
      (item->>'lat')::DOUBLE PRECISION,
      (item->>'lng')::DOUBLE PRECISION,
      item->>'addr',
      item->>'status',
      ROUND((((item->>'upvotes')::INT * 2.5) + (((item->>'age_h')::INT / 24.0) * 1.5) + 20)::NUMERIC, 2),
      v_deadline,
      (item->>'escalation')::INT,
      (item->>'upvotes')::INT,
      v_created,
      v_resolved,
      v_closed
    ) RETURNING id INTO v_issue_id;

    -- Insert report photo
    INSERT INTO issue_photos (issue_id, url, kind, created_at)
    VALUES (v_issue_id, item->>'photo', 'report', v_created);

    -- Insert proof photo if resolved/closed
    IF item ? 'proof' THEN
      INSERT INTO issue_photos (issue_id, url, kind, created_at)
      VALUES (v_issue_id, item->>'proof', 'proof', COALESCE(v_resolved, v_created + INTERVAL '20 hours'));
    END IF;

    -- Insert Initial Timeline Event
    INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
    VALUES (v_issue_id, v_reporter_id, 'created', NULL, 'Submitted', 'Issue reported by citizen via mobile portal', v_created);

    -- Insert Subsequent Events based on status
    IF (item->>'status') IN ('Acknowledged', 'In Progress', 'Resolved', 'Closed', 'Reopened') THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, '44444444-4444-4444-4444-444444444402', 'status_change', 'Submitted', 'Acknowledged', 'Department received report and assigned inspection team.', v_created + INTERVAL '2 hours');
    END IF;

    IF (item->>'status') IN ('In Progress', 'Resolved', 'Closed', 'Reopened') THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, '44444444-4444-4444-4444-444444444402', 'status_change', 'Acknowledged', 'In Progress', 'Crew deployed to the site with repair machinery.', v_created + INTERVAL '6 hours');
    END IF;

    IF (item->>'status') IN ('Resolved', 'Closed') THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, '44444444-4444-4444-4444-444444444402', 'status_change', 'In Progress', 'Resolved', 'Repair work completed. Proof-of-fix photo attached.', v_resolved);
    END IF;

    IF (item->>'status') = 'Closed' THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, v_reporter_id, 'status_change', 'Resolved', 'Closed', 'Citizen confirmed satisfaction with resolution.', v_closed);
    END IF;

    IF (item->>'status') = 'Rejected' THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, '44444444-4444-4444-4444-444444444403', 'status_change', 'Submitted', 'Rejected', 'Private property boundary; falls under society maintenance.', v_created + INTERVAL '4 hours');
    END IF;

    IF (item->>'status') = 'Reopened' THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, v_reporter_id, 'reopened', 'Resolved', 'Reopened', 'Citizen disputed fix: issue recurred within 48 hours.', v_created + INTERVAL '30 hours');
    END IF;

    -- Insert Escalation Event if escalated
    IF (item->>'escalation')::INT > 0 THEN
      INSERT INTO issue_events (issue_id, actor_id, event_type, from_status, to_status, note, created_at)
      VALUES (v_issue_id, NULL, 'escalation', item->>'status', item->>'status', 'Automated SLA escalation triggered: Level ' || (item->>'escalation') || ' alert dispatched.', v_deadline + INTERVAL '1 minute');
    END IF;

    idx := idx + 1;
  END LOOP;
END $$;

-- CivicFix Database Schema Migration
-- Enables PostGIS extension if supported, plus Haversine fallback

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS if available in PostgreSQL environment
DO $$ 
BEGIN 
  CREATE EXTENSION IF NOT EXISTS postgis; 
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'PostGIS not supported, using pure Haversine function';
END $$;

-- 1. Sequence for Public Issue IDs (CF-2026-00001 format)
CREATE SEQUENCE IF NOT EXISTS issue_public_id_seq START 1;

CREATE OR REPLACE FUNCTION generate_issue_public_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CF-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('issue_public_id_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  head_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'admin')) DEFAULT 'citizen',
  full_name TEXT NOT NULL,
  phone TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to departments.head_id after profiles table exists
ALTER TABLE departments 
  DROP CONSTRAINT IF EXISTS fk_departments_head;
ALTER TABLE departments 
  ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  severity_weight INT NOT NULL DEFAULT 5 CHECK (severity_weight BETWEEN 1 AND 10),
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SLA Rules Table
CREATE TABLE IF NOT EXISTS sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL UNIQUE REFERENCES categories(id) ON DELETE CASCADE,
  sla_hours INT NOT NULL DEFAULT 48 CHECK (sla_hours > 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Issues Table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE DEFAULT generate_issue_public_id(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed', 'Rejected', 'Reopened')) DEFAULT 'Submitted',
  priority_score NUMERIC(8, 2) NOT NULL DEFAULT 0,
  sla_deadline TIMESTAMPTZ NOT NULL,
  escalation_level INT NOT NULL DEFAULT 0 CHECK (escalation_level IN (0, 1, 2)),
  upvote_count INT NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes on issues for high performance
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category_id ON issues(category_id);
CREATE INDEX IF NOT EXISTS idx_issues_department_id ON issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_sla_deadline ON issues(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_issues_reporter ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_lat_lng ON issues(lat, lng);

-- 7. Issue Photos Table
CREATE TABLE IF NOT EXISTS issue_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('report', 'proof')) DEFAULT 'report',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_photos_issue_id ON issue_photos(issue_id);

-- 8. Issue Upvotes Table (Strict 1 upvote per user constraint)
CREATE TABLE IF NOT EXISTS issue_upvotes (
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_issue_upvotes_user ON issue_upvotes(user_id);

-- 9. Issue Events Table (Append-only audit trail)
CREATE TABLE IF NOT EXISTS issue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_events_issue_id ON issue_events(issue_id, created_at ASC);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);

-- 11. Haversine Distance Function (Meters)
CREATE OR REPLACE FUNCTION haversine_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  r CONSTANT DOUBLE PRECISION := 6371000; -- Earth radius in meters
  phi1 DOUBLE PRECISION;
  phi2 DOUBLE PRECISION;
  delta_phi DOUBLE PRECISION;
  delta_lambda DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  phi1 := radians(lat1);
  phi2 := radians(lat2);
  delta_phi := radians(lat2 - lat1);
  delta_lambda := radians(lon2 - lon1);

  a := sin(delta_phi / 2.0)^2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2.0)^2;
  c := 2.0 * atan2(sqrt(a), sqrt(greatest(0.0, 1.0 - a)));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 12. RPC for Duplicate Detection (Radius in meters, default 50m)
CREATE OR REPLACE FUNCTION find_nearby_duplicates(
  p_category_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (
  id UUID,
  public_id TEXT,
  title TEXT,
  description TEXT,
  status TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address_text TEXT,
  distance_meters DOUBLE PRECISION,
  upvote_count INT,
  created_at TIMESTAMPTZ,
  first_photo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.public_id,
    i.title,
    i.description,
    i.status,
    i.lat,
    i.lng,
    i.address_text,
    ROUND(haversine_distance(p_lat, p_lng, i.lat, i.lng)::NUMERIC, 1)::DOUBLE PRECISION AS distance_meters,
    i.upvote_count,
    i.created_at,
    (
      SELECT p.url FROM issue_photos p 
      WHERE p.issue_id = i.id 
      ORDER BY p.created_at ASC 
      LIMIT 1
    ) AS first_photo_url
  FROM issues i
  WHERE i.category_id = p_category_id
    AND i.status NOT IN ('Closed', 'Rejected')
    AND haversine_distance(p_lat, p_lng, i.lat, i.lng) <= p_radius_meters
  ORDER BY distance_meters ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

-- 13. Upvote Counter & Priority Trigger
CREATE OR REPLACE FUNCTION update_issue_upvotes_and_priority()
RETURNS TRIGGER AS $$
DECLARE
  target_issue_id UUID;
  new_count INT;
  sev_weight INT;
  issue_age_days NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_issue_id := NEW.issue_id;
  ELSE
    target_issue_id := OLD.issue_id;
  END IF;

  -- Calculate current upvote count
  SELECT COUNT(*)::INT INTO new_count FROM issue_upvotes WHERE issue_id = target_issue_id;

  -- Fetch category severity weight & age
  SELECT c.severity_weight, EXTRACT(EPOCH FROM (NOW() - i.created_at)) / 86400.0
  INTO sev_weight, issue_age_days
  FROM issues i
  JOIN categories c ON c.id = i.category_id
  WHERE i.id = target_issue_id;

  -- Priority formula: (upvotes * 2.5) + (age_days * 1.5) + (severity * 3.0)
  UPDATE issues
  SET 
    upvote_count = new_count,
    priority_score = ROUND(((new_count * 2.5) + (COALESCE(issue_age_days, 0) * 1.5) + (COALESCE(sev_weight, 5) * 3.0))::NUMERIC, 2)
  WHERE id = target_issue_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upvote_added ON issue_upvotes;
CREATE TRIGGER trg_upvote_added
AFTER INSERT OR DELETE ON issue_upvotes
FOR EACH ROW EXECUTE FUNCTION update_issue_upvotes_and_priority();

-- 14. Trigger for new user profile creation from auth.users
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- 15. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's officer department
CREATE OR REPLACE FUNCTION get_officer_department()
RETURNS UUID AS $$
  SELECT department_id FROM profiles 
  WHERE id = auth.uid() AND role = 'officer'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
CREATE POLICY "Public can view basic profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (is_admin());

-- Departments Policies
CREATE POLICY "Departments are viewable by all" ON departments FOR SELECT USING (true);
CREATE POLICY "Only admins can modify departments" ON departments FOR ALL USING (is_admin());

-- Categories Policies
CREATE POLICY "Categories are viewable by all" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL USING (is_admin());

-- SLA Rules Policies
CREATE POLICY "SLA rules are viewable by all" ON sla_rules FOR SELECT USING (true);
CREATE POLICY "Only admins can modify SLA rules" ON sla_rules FOR ALL USING (is_admin());

-- Issues Policies
-- Public can view non-rejected issues; Admins, Officers of department, and Reporter can view all
CREATE POLICY "Issues viewable by public if not rejected" ON issues FOR SELECT USING (
  status != 'Rejected' 
  OR auth.uid() = reporter_id 
  OR is_admin() 
  OR department_id = get_officer_department()
);

-- Authenticated users can insert their own issues
CREATE POLICY "Citizens can insert issues" ON issues FOR INSERT WITH CHECK (
  auth.uid() = reporter_id
);

-- Officers can update issues belonging to their department; Admins can update any; Citizen can update only for reopen/confirm
CREATE POLICY "Officers can update department issues" ON issues FOR UPDATE USING (
  is_admin() 
  OR department_id = get_officer_department()
  OR auth.uid() = reporter_id
);

-- Issue Photos Policies
CREATE POLICY "Issue photos viewable by all" ON issue_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert issue photos" ON issue_photos FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Issue Upvotes Policies
CREATE POLICY "Issue upvotes viewable by all" ON issue_upvotes FOR SELECT USING (true);
CREATE POLICY "Citizens can insert their own upvotes" ON issue_upvotes FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Citizens can delete their own upvotes" ON issue_upvotes FOR DELETE USING (
  auth.uid() = user_id
);

-- Issue Events Policies
CREATE POLICY "Events viewable by all for visible issues" ON issue_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert events" ON issue_events FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' OR auth.role() = 'service_role'
);

-- Enable Realtime publication for issues and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE issue_events;

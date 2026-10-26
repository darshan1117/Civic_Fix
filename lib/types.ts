export type UserRole = 'citizen' | 'officer' | 'admin';

export type IssueStatus =
  | 'Submitted'
  | 'Acknowledged'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  | 'Reopened';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  department_id?: string | null;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  department_id: string;
  severity_weight: number;
  icon?: string | null;
  created_at: string;
}

export interface SLARule {
  id: string;
  category_id: string;
  sla_hours: number;
  updated_at: string;
}

export interface IssuePhoto {
  id: string;
  issue_id: string;
  url: string;
  kind: 'report' | 'proof';
  created_at: string;
}

export interface IssueUpvote {
  issue_id: string;
  user_id: string;
  created_at: string;
}

export interface IssueEvent {
  id: string;
  issue_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: UserRole | null;
  event_type: 'created' | 'status_change' | 'escalation' | 'reopened' | 'upvote' | 'comment';
  from_status?: IssueStatus | null;
  to_status?: IssueStatus | null;
  note?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  issue_id: string;
  issue_public_id?: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  public_id: string;
  reporter_id: string;
  reporter_name?: string;
  category_id: string;
  category_name?: string;
  department_id: string;
  department_name?: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  address_text: string;
  status: IssueStatus;
  priority_score: number;
  sla_deadline: string;
  escalation_level: 0 | 1 | 2;
  upvote_count: number;
  has_upvoted?: boolean;
  created_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  photos?: IssuePhoto[];
  events?: IssueEvent[];
}

export interface SimilarIssue {
  id: string;
  public_id: string;
  title: string;
  description: string;
  status: IssueStatus;
  lat: number;
  lng: number;
  address_text: string;
  distance_meters: number;
  upvote_count: number;
  created_at: string;
  first_photo_url?: string | null;
}

export interface CreateIssueInput {
  category_id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  address_text: string;
  photos: string[];
}

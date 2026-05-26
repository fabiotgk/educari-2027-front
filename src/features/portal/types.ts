export type PortalAccountType = 'guardian' | 'student';

export interface PortalAccount {
  id: string;
  tenant_id: string;
  account_type: PortalAccountType;
  guardian_id: string | null;
  student_id: string | null;
  login: string;
  name: string;
  email: string | null;
  is_active: boolean;
  consent_given: boolean;
  consent_at: string | null;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PortalStudent {
  id: string;
  full_name: string;
}

export interface PortalLoginPayload {
  tenant_slug: string;
  login: string;
  password: string;
}

export interface PortalLoginResponse {
  token: string;
  account: PortalAccount;
}

export interface PortalMeResponse {
  account: PortalAccount;
  students: PortalStudent[];
}

export interface PortalGrade {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  subject_id: string;
  evaluation_period_id: string;
  kind: string;
  activity_label: string;
  weight: number | string | null;
  score_numeric: number | string | null;
  score_concept: string | null;
  score_descriptive: string | null;
  recorded_at: string | null;
  is_recovered: boolean;
  notes: string | null;
  subject?: {
    id: string | null;
    name: string | null;
  };
  evaluation_period?: {
    id: string | null;
    name: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface PortalAttendanceRecord {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  class_diary_id: string;
  lesson_date: string | null;
  lesson_number_in_day: number | null;
  status: string;
  absence_reason_id: string | null;
  notes: string | null;
  recorded_via: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PortalAnnouncement {
  id: string;
  tenant_id: string;
  kind: string;
  title: string;
  summary: string | null;
  body: string;
  attachment_file_ids: string[] | null;
  published_at: string | null;
  expires_at: string | null;
  priority: string;
  requires_read_confirmation: boolean;
  requires_authorization: boolean;
  created_by_user_id: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface ApiEnvelope<T> {
  data: T;
}

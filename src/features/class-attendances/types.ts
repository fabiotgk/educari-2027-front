export interface ClassAttendance {
  id: string;
  tenant_id: string;
  class_id: string;
  lesson_date: string | null;
  present_count: number | null;
  absent_count: number | null;
  total_enrolled: number | null;
  attendance_pct: number | null;
  closed_by_user_id: string | null;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

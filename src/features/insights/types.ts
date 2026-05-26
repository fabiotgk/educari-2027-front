export interface InsightsOverview {
  total_students: number;
  total_schools: number;
  total_staff: number;
  active_enrollments: number;
  attendance_rate: number;
  evasion_count: number;
}

export interface EnrollmentBySchool {
  school_id: string | null;
  school_name: string | null;
  total: number;
}

export interface AttendanceSummary {
  attendance_rate: number;
  total_records: number;
  present: number;
  absent: number;
}

export type EvasionStatus = string;

export interface EvasionSummary {
  total: number;
  by_status: Record<EvasionStatus, number>;
}

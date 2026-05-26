export type CourseLevel = 'basico' | 'intermediario' | 'avancado';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface LmsUserSummary {
  id: string;
  name: string;
  email?: string | null;
}

export interface Course {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  workload_hours: number | null;
  level: CourseLevel | null;
  status: CourseStatus | null;
  is_self_paced: boolean;
  starts_at: string | null;
  ends_at: string | null;
  instructor_id: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  instructor?: LmsUserSummary | null;
}

export interface CourseEnrollmentRow {
  id: string;
  course_id: string;
  student_id?: string | null;
  user_id?: string | null;
  status: string;
  progress_percent: number | string | null;
  enrolled_at: string | null;
  completed_at?: string | null;
  final_grade?: number | string | null;
  student?: { id: string; name: string } | null;
  user?: LmsUserSummary | null;
}

export interface ForumThreadRow {
  id: string;
  course_id: string;
  title: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  replies_count?: number | null;
  views_count?: number | null;
  last_reply_at?: string | null;
  author?: LmsUserSummary | null;
}

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

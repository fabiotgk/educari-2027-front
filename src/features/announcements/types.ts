/** Tipos do recurso M11 / Comunicação — espelham o AnnouncementResource do backend. */

export type AnnouncementKind = 'circular' | 'memo' | 'urgent' | 'marketing';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AnnouncementTargetType =
  | 'tenant'
  | 'school'
  | 'class'
  | 'role'
  | 'user'
  | 'guardian_of_grade';

export interface AnnouncementTarget {
  id: string;
  target_type: AnnouncementTargetType;
  target_id: string | null;
  target_value: string | null;
}

export interface Announcement {
  id: string;
  tenant_id: string;
  kind: AnnouncementKind;
  title: string;
  summary: string | null;
  body: string;
  attachment_file_ids: string[] | null;
  published_at: string | null;
  expires_at: string | null;
  priority: AnnouncementPriority;
  requires_read_confirmation: boolean;
  requires_authorization: boolean;
  created_by_user_id: string;
  targets: AnnouncementTarget[] | null;
  read_receipts_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const ANNOUNCEMENT_KIND_LABELS: Record<AnnouncementKind, string> = {
  circular: 'Circular',
  memo: 'Memorando',
  urgent: 'Urgente',
  marketing: 'Divulgação',
};

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ANNOUNCEMENT_TARGET_TYPE_LABELS: Record<AnnouncementTargetType, string> = {
  tenant: 'Toda a rede',
  school: 'Escola',
  class: 'Turma',
  role: 'Papel/Perfil',
  user: 'Usuário',
  guardian_of_grade: 'Responsáveis por série',
};

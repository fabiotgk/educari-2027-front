export type EvasionOccurrenceKind =
  | 'low_attendance'
  | 'consecutive_absences'
  | 'dropout_risk';

export type EvasionOccurrenceStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

export type EvasionOccurrenceAssignedTo =
  | 'school'
  | 'sme'
  | 'conselho_tutelar'
  | 'ministerio_publico';

export interface EvasionOccurrence {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  student_id: string;
  kind: EvasionOccurrenceKind;
  assigned_to: EvasionOccurrenceAssignedTo;
  status: EvasionOccurrenceStatus;
  attendance_pct_at_detection: number | string | null;
  consecutive_absences_at_detection: number | string | null;
  reason: string | null;
  notes: string | null;
  detected_at: string | null;
  resolved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const EVASION_OCCURRENCE_KIND_LABELS: Record<EvasionOccurrenceKind, string> = {
  low_attendance: 'Baixa frequência',
  consecutive_absences: 'Faltas consecutivas',
  dropout_risk: 'Risco de abandono',
};

export const EVASION_OCCURRENCE_STATUS_LABELS: Record<EvasionOccurrenceStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em atendimento',
  escalated: 'Escalonada',
  resolved: 'Resolvida',
  closed: 'Fechada',
};

export const EVASION_OCCURRENCE_ASSIGNED_TO_LABELS: Record<EvasionOccurrenceAssignedTo, string> = {
  school: 'Escola',
  sme: 'SME',
  conselho_tutelar: 'Conselho Tutelar',
  ministerio_publico: 'Ministério Público',
};

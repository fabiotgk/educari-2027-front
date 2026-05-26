/** Tipos do recurso M38 / Cursos Livres — espelham o OpenCourseResource do backend. */

export type OpenCourseModality = 'presencial' | 'ead' | 'hibrido';
export type OpenCourseStatus = 'draft' | 'open' | 'closed';

export interface OpenCourse {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  modality: OpenCourseModality;
  workload_hours: number;
  vacancies: number | null;
  starts_at: string | null;
  ends_at: string | null;
  status: OpenCourseStatus;
  certificate_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const MODALITY_LABELS: Record<OpenCourseModality, string> = {
  presencial: 'Presencial',
  ead: 'EAD',
  hibrido: 'Híbrido',
};

export const STATUS_LABELS: Record<OpenCourseStatus, string> = {
  draft: 'Rascunho',
  open: 'Inscrições abertas',
  closed: 'Encerrado',
};

/** Tipos do recurso M18 / Educacenso — espelham o EducacensoExportResource do backend. */

export type EducacensoStage = 'matricula_inicial' | 'situacao_aluno';

export type EducacensoStatus =
  | 'draft'
  | 'validating'
  | 'ready'
  | 'exported'
  | 'failed';

export interface EducacensoExport {
  id: string;
  tenant_id: string;
  reference_year: string | number;
  stage: EducacensoStage;
  status: EducacensoStatus;
  school_ids: string[] | null;
  file_path: string | null;
  record_count: number | null;
  generated_at: string | null;
  created_by_user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export const EDUCACENSO_STAGE_LABELS: Record<EducacensoStage, string> = {
  matricula_inicial: 'Matrícula inicial',
  situacao_aluno: 'Situação do aluno',
};

export const EDUCACENSO_STATUS_LABELS: Record<EducacensoStatus, string> = {
  draft: 'Rascunho',
  validating: 'Validando',
  ready: 'Pronto',
  exported: 'Exportado',
  failed: 'Com falhas',
};

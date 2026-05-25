/** Tipos do recurso M08 / Templates de Documentos — espelham DocumentTemplateResource do backend. */

export type DocumentKind =
  | 'boletim'
  | 'historico'
  | 'declaracao_matricula'
  | 'declaracao_frequencia'
  | 'declaracao_transferencia'
  | 'certificado_conclusao'
  | 'ficha_individual';

export interface DocumentTemplate {
  id: string;
  tenant_id: string;
  kind: DocumentKind;
  name: string;
  header_html: string | null;
  footer_html: string | null;
  body_template: string;
  variables_schema: Record<string, unknown> | null;
  is_default: boolean;
  is_active: boolean;
  version: number;
  created_at: string | null;
  updated_at: string | null;
}

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  boletim: 'Boletim',
  historico: 'Histórico escolar',
  declaracao_matricula: 'Declaração de matrícula',
  declaracao_frequencia: 'Declaração de frequência',
  declaracao_transferencia: 'Declaração de transferência',
  certificado_conclusao: 'Certificado de conclusão',
  ficha_individual: 'Ficha individual',
};

/** Tipos do recurso M17 / Concurso de Remoção — espelham o TransferEventResource do backend. */

export type TransferEventStatus =
  | 'draft'
  | 'open'
  | 'classified'
  | 'executed'
  | 'published'
  | 'cancelled';

export interface TransferEvent {
  id: string;
  tenant_id: string;
  academic_year: string;
  title: string;
  act_reference: string | null;
  description: string | null;
  reason: string | null;
  event_date: string | null;
  rules: unknown[] | null;
  status: TransferEventStatus;
  created_by_user_id: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const TRANSFER_EVENT_STATUS_LABELS: Record<TransferEventStatus, string> = {
  draft: 'Rascunho',
  open: 'Aberto',
  classified: 'Classificado',
  executed: 'Executado',
  published: 'Publicado',
  cancelled: 'Cancelado',
};

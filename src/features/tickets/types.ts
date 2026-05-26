/** Tipos do recurso M30 / HelpDesk — espelham o TicketResource do backend. */

export type TicketPriority = 'low' | 'normal' | 'high' | 'critical';
export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_requester'
  | 'resolved'
  | 'closed';

export interface TicketCategory {
  id: string;
  name: string;
}

export interface TicketUserRef {
  id: string;
  name: string;
  email: string;
}

export interface TicketSchoolRef {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  tenant_id: string;
  ticket_category_id: string | null;
  requester_user_id: string;
  school_id: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to_user_id: string | null;
  opened_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  category: TicketCategory | null;
  requester: TicketUserRef | null;
  assignee: TicketUserRef | null;
  school: TicketSchoolRef | null;
}

export interface TicketComment {
  id: string;
  tenant_id: string;
  ticket_id: string;
  author_user_id: string;
  body: string;
  is_internal: boolean;
  created_at: string | null;
  updated_at: string | null;
  author: TicketUserRef | null;
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  critical: 'Crítica',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_requester: 'Aguardando solicitante',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

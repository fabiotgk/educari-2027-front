import { z } from 'zod';

import type { Ticket } from './types';

const TICKET_PRIORITIES = ['low', 'normal', 'high', 'critical'] as const;

/**
 * Schema do formulário de Chamado. Os nomes dos campos espelham o
 * CreateTicketRequest do backend para que os erros 422 mapeiem
 * direto nos campos via applyApiErrors.
 */
export const ticketSchema = z.object({
  subject: z.string().min(1, 'O assunto do chamado é obrigatório.').max(255),
  description: z.string().min(1, 'A descrição do chamado é obrigatória.').max(5000),
  priority: z.enum(TICKET_PRIORITIES, { error: 'Selecione a prioridade.' }),
  ticket_category_id: z.string().uuid().optional().or(z.literal('')),
  school_id: z.string().uuid().optional().or(z.literal('')),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

/** Valores iniciais para criação. */
export const emptyTicketForm: TicketFormValues = {
  subject: '',
  description: '',
  priority: 'normal',
  ticket_category_id: '',
  school_id: '',
};

/** Converte um Ticket (API) nos valores do formulário (para edição). */
export function ticketToForm(t: Ticket): TicketFormValues {
  return {
    subject: t.subject,
    description: t.description,
    priority: t.priority,
    ticket_category_id: t.ticket_category_id ?? '',
    school_id: t.school_id ?? '',
  };
}

const blank = (v: string | undefined) =>
  v && v.trim() !== '' ? v.trim() : undefined;

/** Monta o payload para a API, omitindo vazios. */
export function buildTicketPayload(v: TicketFormValues): Record<string, unknown> {
  return {
    subject: v.subject.trim(),
    description: v.description.trim(),
    priority: v.priority,
    ticket_category_id: blank(v.ticket_category_id) ?? null,
    school_id: blank(v.school_id) ?? null,
  };
}

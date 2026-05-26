import { z } from 'zod';

import type { TransferEvent } from './types';

const TRANSFER_EVENT_STATUSES = [
  'draft',
  'open',
  'classified',
  'executed',
  'published',
  'cancelled',
] as const;

/**
 * Schema do formulário de Evento de Remoção.
 * Os nomes dos campos espelham o CreateTransferEventRequest do backend.
 */
export const transferEventSchema = z.object({
  academic_year: z
    .string()
    .min(4, 'O ano letivo deve ter 4 dígitos.')
    .max(4, 'O ano letivo deve ter 4 dígitos.')
    .regex(/^\d{4}$/, 'O ano letivo deve conter apenas dígitos.'),
  title: z.string().min(1, 'O título do evento é obrigatório.').max(255),
  act_reference: z.string().max(128).optional(),
  description: z.string().optional(),
  reason: z.string().max(255).optional(),
  event_date: z.string().optional(),
  status: z.enum(TRANSFER_EVENT_STATUSES, { error: 'Selecione o status do evento.' }),
});

export type TransferEventFormValues = z.infer<typeof transferEventSchema>;

/** Valores iniciais para criação. */
export const emptyTransferEventForm: TransferEventFormValues = {
  academic_year: '',
  title: '',
  act_reference: '',
  description: '',
  reason: '',
  event_date: '',
  status: 'draft' as const,
};

/** Converte um TransferEvent (API) nos valores do formulário (para edição). */
export function transferEventToForm(e: TransferEvent): TransferEventFormValues {
  return {
    academic_year: e.academic_year,
    title: e.title,
    act_reference: e.act_reference ?? '',
    description: e.description ?? '',
    reason: e.reason ?? '',
    event_date: e.event_date ? e.event_date.slice(0, 10) : '',
    status: e.status,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios. */
export function buildTransferEventPayload(v: TransferEventFormValues): Record<string, unknown> {
  return {
    academic_year: v.academic_year.trim(),
    title: v.title.trim(),
    act_reference: blank(v.act_reference),
    description: blank(v.description),
    reason: blank(v.reason),
    event_date: blank(v.event_date),
    status: v.status,
  };
}

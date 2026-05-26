import { z } from 'zod';

import type { Announcement } from './types';

const ANNOUNCEMENT_KINDS = ['circular', 'memo', 'urgent', 'marketing'] as const;
const ANNOUNCEMENT_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
const TARGET_TYPES = [
  'tenant',
  'school',
  'class',
  'role',
  'user',
  'guardian_of_grade',
] as const;

const targetSchema = z.object({
  target_type: z.enum(TARGET_TYPES, { error: 'Selecione o tipo do público-alvo.' }),
  target_id: z.string().optional().or(z.literal('')),
  target_value: z.string().max(128).optional().or(z.literal('')),
});

/**
 * Schema do formulário de Comunicado. Os nomes dos campos espelham o
 * CreateAnnouncementRequest do backend para que os erros 422 mapeiem
 * direto nos campos via applyApiErrors.
 */
export const announcementSchema = z.object({
  kind: z.enum(ANNOUNCEMENT_KINDS, { error: 'Selecione o tipo do comunicado.' }),
  title: z.string().min(1, 'O título do comunicado é obrigatório.').max(255),
  summary: z.string().max(512).optional().or(z.literal('')),
  body: z.string().min(1, 'O conteúdo do comunicado é obrigatório.'),
  published_at: z.string().optional().or(z.literal('')),
  expires_at: z.string().optional().or(z.literal('')),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES, { error: 'Selecione a prioridade.' }),
  requires_read_confirmation: z.boolean(),
  requires_authorization: z.boolean(),
  targets: z
    .array(targetSchema)
    .min(1, 'Informe pelo menos um público-alvo.'),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

/** Valores iniciais para criação. */
export const emptyAnnouncementForm: AnnouncementFormValues = {
  kind: 'circular',
  title: '',
  summary: '',
  body: '',
  published_at: '',
  expires_at: '',
  priority: 'normal',
  requires_read_confirmation: false,
  requires_authorization: false,
  targets: [{ target_type: 'tenant', target_id: '', target_value: '' }],
};

/** Converte um Announcement (API) nos valores do formulário (para edição). */
export function announcementToForm(a: Announcement): AnnouncementFormValues {
  return {
    kind: a.kind,
    title: a.title,
    summary: a.summary ?? '',
    body: a.body,
    published_at: a.published_at ? a.published_at.slice(0, 16) : '',
    expires_at: a.expires_at ? a.expires_at.slice(0, 16) : '',
    priority: a.priority,
    requires_read_confirmation: a.requires_read_confirmation,
    requires_authorization: a.requires_authorization,
    targets: a.targets?.length
      ? a.targets.map((t) => ({
          target_type: t.target_type,
          target_id: t.target_id ?? '',
          target_value: t.target_value ?? '',
        }))
      : [{ target_type: 'tenant', target_id: '', target_value: '' }],
  };
}

const blank = (v: string | undefined) =>
  v && v.trim() !== '' ? v.trim() : undefined;

/** Monta o payload para a API, omitindo vazios. */
export function buildAnnouncementPayload(v: AnnouncementFormValues): Record<string, unknown> {
  return {
    kind: v.kind,
    title: v.title.trim(),
    summary: blank(v.summary),
    body: v.body,
    published_at: blank(v.published_at),
    expires_at: blank(v.expires_at),
    priority: v.priority,
    requires_read_confirmation: v.requires_read_confirmation,
    requires_authorization: v.requires_authorization,
    targets: v.targets.map((t) => ({
      target_type: t.target_type,
      target_id: blank(t.target_id) ?? null,
      target_value: blank(t.target_value) ?? null,
    })),
  };
}

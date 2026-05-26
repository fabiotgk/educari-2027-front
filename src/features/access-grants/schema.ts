import { z } from 'zod';

import type { AccessGrant } from './types';

const SCOPE_TYPES = ['tenant', 'school'] as const;

/**
 * Schema do formulário de AccessGrant. Os nomes dos campos espelham o
 * CreateAccessGrantRequest / UpdateAccessGrantRequest do backend,
 * para que os erros 422 mapeiem direto nos campos via applyApiErrors.
 */
export const accessGrantSchema = z
  .object({
    user_id: z.string().uuid('O identificador do usuário deve ser um UUID válido.'),
    role: z.string().min(1, 'O papel (role) é obrigatório.').max(128, 'O papel não pode exceder 128 caracteres.'),
    scope_type: z.enum(SCOPE_TYPES).optional().or(z.literal('')),
    scope_id: z.string().uuid('O identificador do escopo deve ser um UUID válido.').optional().or(z.literal('')),
    granted_by_user_id: z.string().uuid('O identificador do concedente deve ser um UUID válido.').optional().or(z.literal('')),
    starts_at: z.string().optional().or(z.literal('')),
    expires_at: z.string().optional().or(z.literal('')),
    revoked_at: z.string().optional().or(z.literal('')),
    notes: z.string().max(5000, 'As observações não podem exceder 5000 caracteres.').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.expires_at) {
        return new Date(data.expires_at) >= new Date(data.starts_at);
      }
      return true;
    },
    {
      message: 'A data de expiração deve ser igual ou posterior à data de início.',
      path: ['expires_at'],
    },
  );

export type AccessGrantFormValues = z.infer<typeof accessGrantSchema>;

/** Valores iniciais para criação. */
export const emptyAccessGrantForm: AccessGrantFormValues = {
  user_id: '',
  role: '',
  scope_type: '',
  scope_id: '',
  granted_by_user_id: '',
  starts_at: '',
  expires_at: '',
  revoked_at: '',
  notes: '',
};

/** Converte um AccessGrant (API) nos valores do formulário (para edição). */
export function accessGrantToForm(ag: AccessGrant): AccessGrantFormValues {
  return {
    user_id: ag.user_id,
    role: ag.role,
    scope_type: ag.scope_type ?? '',
    scope_id: ag.scope_id ?? '',
    granted_by_user_id: ag.granted_by_user_id ?? '',
    starts_at: ag.starts_at ?? '',
    expires_at: ag.expires_at ?? '',
    revoked_at: ag.revoked_at ?? '',
    notes: ag.notes ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios. */
export function buildAccessGrantPayload(v: AccessGrantFormValues): Record<string, unknown> {
  return {
    user_id: v.user_id.trim(),
    role: v.role.trim(),
    scope_type: blank(v.scope_type),
    scope_id: blank(v.scope_id),
    granted_by_user_id: blank(v.granted_by_user_id),
    starts_at: blank(v.starts_at),
    expires_at: blank(v.expires_at),
    revoked_at: blank(v.revoked_at),
    notes: blank(v.notes),
  };
}

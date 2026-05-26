import { z } from 'zod';

import type { FacialEnrollment } from './types';

const STATUSES = ['pending', 'active', 'revoked'] as const;

/**
 * Schema do formulário de Cadastro Facial. Os nomes dos campos espelham o
 * CreateFacialEnrollmentRequest / UpdateFacialEnrollmentRequest do backend,
 * para que os erros 422 mapeiem direto nos campos via applyApiErrors.
 */
export const facialEnrollmentSchema = z.object({
  student_id: z
    .string()
    .uuid('O identificador do aluno deve ser um UUID válido.')
    .min(1, 'O aluno é obrigatório.'),
  photo_reference: z
    .string()
    .min(1, 'A referência da foto é obrigatória.')
    .max(512, 'A referência da foto não pode exceder 512 caracteres.'),
  template_hash: z
    .string()
    .max(512, 'O hash do template não pode exceder 512 caracteres.')
    .optional()
    .or(z.literal('')),
  consent_given: z.boolean({
    error: 'A indicação de consentimento é obrigatória.',
  }),
  consent_at: z.string().optional().or(z.literal('')),
  status: z.enum(STATUSES, { error: 'Selecione o status.' }),
  enrolled_at: z.string().optional().or(z.literal('')),
});

export type FacialEnrollmentFormValues = z.infer<typeof facialEnrollmentSchema>;

/** Valores iniciais para criação. */
export const emptyFacialEnrollmentForm: FacialEnrollmentFormValues = {
  student_id: '',
  photo_reference: '',
  template_hash: '',
  consent_given: false,
  consent_at: '',
  status: 'pending',
  enrolled_at: '',
};

/** Converte um FacialEnrollment (API) nos valores do formulário (para edição). */
export function facialEnrollmentToForm(
  data: FacialEnrollment,
): FacialEnrollmentFormValues {
  return {
    student_id: data.student_id,
    photo_reference: data.photo_reference,
    template_hash: data.template_hash ?? '',
    consent_given: data.consent_given,
    consent_at: data.consent_at ? data.consent_at.slice(0, 10) : '',
    status: data.status,
    enrolled_at: data.enrolled_at ? data.enrolled_at.slice(0, 10) : '',
  };
}

function blank(v: string | undefined) {
  return v && v.trim() !== '' ? v.trim() : undefined;
}

/** Monta o payload para a API, omitindo vazios. */
export function buildFacialEnrollmentPayload(
  v: FacialEnrollmentFormValues,
): Record<string, unknown> {
  return {
    student_id: v.student_id,
    photo_reference: v.photo_reference.trim(),
    template_hash: blank(v.template_hash),
    consent_given: v.consent_given,
    consent_at: blank(v.consent_at),
    status: v.status,
    enrolled_at: blank(v.enrolled_at),
  };
}

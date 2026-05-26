import { z } from 'zod';

import type { AbsenceReason } from './types';

export const absenceReasonSchema = z.object({
  code: z.string().min(1, 'O código é obrigatório.').max(32, 'O código deve ter no máximo 32 caracteres.'),
  name: z.string().min(1, 'O nome é obrigatório.').max(128, 'O nome deve ter no máximo 128 caracteres.'),
  is_justified: z.boolean(),
  requires_document: z.boolean(),
  is_active: z.boolean(),
});

export type AbsenceReasonFormValues = z.infer<typeof absenceReasonSchema>;

export const emptyAbsenceReasonForm: AbsenceReasonFormValues = {
  code: '',
  name: '',
  is_justified: false,
  requires_document: false,
  is_active: true,
};

export function absenceReasonToForm(reason: AbsenceReason): AbsenceReasonFormValues {
  return {
    code: reason.code,
    name: reason.name,
    is_justified: reason.is_justified,
    requires_document: reason.requires_document,
    is_active: reason.is_active,
  };
}

export function buildAbsenceReasonPayload(values: AbsenceReasonFormValues): Record<string, unknown> {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    is_justified: values.is_justified,
    requires_document: values.requires_document,
    is_active: values.is_active,
  };
}

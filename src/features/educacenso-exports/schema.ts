import { z } from 'zod';

import type { EducacensoExport } from './types';

const EDUCACENSO_STAGES = ['matricula_inicial', 'situacao_aluno'] as const;
const EDUCACENSO_STATUSES = ['draft', 'validating', 'ready', 'exported', 'failed'] as const;

/**
 * Schema do formulário de Exportação Educacenso.
 * Os nomes dos campos espelham o CreateEducacensoExportRequest do backend.
 */
export const educacensoExportSchema = z.object({
  reference_year: z
    .string()
    .min(4, 'O ano de referência deve ter 4 dígitos.')
    .max(4, 'O ano de referência deve ter 4 dígitos.')
    .regex(/^\d{4}$/, 'O ano de referência deve conter apenas números.'),
  stage: z.enum(EDUCACENSO_STAGES, { error: 'Selecione a etapa do Educacenso.' }),
  school_ids: z.string().optional(),
  status: z.enum(EDUCACENSO_STATUSES),
});

export type EducacensoExportFormValues = z.infer<typeof educacensoExportSchema>;

/** Valores iniciais para criação. */
export const emptyEducacensoExportForm: EducacensoExportFormValues = {
  reference_year: '',
  stage: 'matricula_inicial' as const,
  school_ids: '',
  status: 'draft' as const,
};

/** Converte um EducacensoExport (API) nos valores do formulário (para edição). */
export function educacensoExportToForm(e: EducacensoExport): EducacensoExportFormValues {
  return {
    reference_year: String(e.reference_year),
    stage: e.stage,
    school_ids: e.school_ids?.join(', ') ?? '',
    status: e.status,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios. */
export function buildEducacensoExportPayload(
  v: EducacensoExportFormValues,
): Record<string, unknown> {
  const rawIds = blank(v.school_ids);
  const school_ids = rawIds
    ? rawIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  return {
    reference_year: v.reference_year.trim(),
    stage: v.stage,
    school_ids,
    status: v.status,
  };
}

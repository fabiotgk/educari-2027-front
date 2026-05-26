import { z } from 'zod';

import type { OpenCourse } from './types';

const MODALITIES = ['presencial', 'ead', 'hibrido'] as const;
const STATUSES = ['draft', 'open', 'closed'] as const;

/**
 * Schema do formulário de Curso Livre. Os nomes dos campos espelham o
 * CreateOpenCourseRequest do backend, para que os erros 422 mapeiem
 * direto nos campos via applyApiErrors.
 */
export const openCourseSchema = z
  .object({
    title: z.string().min(1, 'O título do curso é obrigatório.').max(255, 'O título não pode exceder 255 caracteres.'),
    description: z.string().max(5000, 'A descrição não pode exceder 5000 caracteres.').optional().or(z.literal('')),
    modality: z.enum(MODALITIES, { message: 'A modalidade do curso é obrigatória.' }),
    workload_hours: z.number().int('A carga horária deve ser um número inteiro.').min(0, 'A carga horária não pode ser negativa.'),
    vacancies: z.number().int('O número de vagas deve ser um número inteiro.').min(1, 'O número de vagas deve ser pelo menos 1.').optional(),
    starts_at: z.string().optional().or(z.literal('')),
    ends_at: z.string().optional().or(z.literal('')),
    status: z.enum(STATUSES, { message: 'O status do curso é obrigatório.' }),
    certificate_enabled: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.starts_at || !data.ends_at) return true;
      return new Date(data.ends_at) >= new Date(data.starts_at);
    },
    {
      message: 'A data de término deve ser igual ou posterior à data de início.',
      path: ['ends_at'],
    },
  );

export type OpenCourseFormValues = z.infer<typeof openCourseSchema>;

/** Valores iniciais para criação. */
export const emptyOpenCourseForm: OpenCourseFormValues = {
  title: '',
  description: '',
  modality: 'presencial',
  workload_hours: 0,
  vacancies: undefined,
  starts_at: '',
  ends_at: '',
  status: 'draft',
  certificate_enabled: false,
};

/** Converte um OpenCourse (API) nos valores do formulário (para edição). */
export function openCourseToForm(c: OpenCourse): OpenCourseFormValues {
  return {
    title: c.title,
    description: c.description ?? '',
    modality: c.modality,
    workload_hours: c.workload_hours,
    vacancies: c.vacancies ?? undefined,
    starts_at: c.starts_at ? c.starts_at.split('T')[0] : '',
    ends_at: c.ends_at ? c.ends_at.split('T')[0] : '',
    status: c.status,
    certificate_enabled: c.certificate_enabled,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e convertendo tipos. */
export function buildOpenCoursePayload(v: OpenCourseFormValues): Record<string, unknown> {
  return {
    title: v.title.trim(),
    description: blank(v.description),
    modality: v.modality,
    workload_hours: v.workload_hours,
    vacancies: v.vacancies == null ? null : v.vacancies,
    starts_at: blank(v.starts_at),
    ends_at: blank(v.ends_at),
    status: v.status,
    certificate_enabled: v.certificate_enabled,
  };
}

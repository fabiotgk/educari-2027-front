import { z } from 'zod';

import type { LessonPlan } from './types';

const requiredIntegerMessage = (label: string) => `Informe ${label} em formato numérico inteiro.`;

const requiredInteger = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} é obrigatória.`)
    .refine((value) => /^\d+$/.test(value), { message: `Informe ${label} em formato numérico inteiro.` });

const optionalInteger = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^\d+$/.test(value), {
      message: `Informe ${label} em formato numérico inteiro.`,
    });

const toStringArray = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

const normalizeText = (value: string | undefined) => (value && value.trim() !== '' ? value.trim() : undefined);

export const lessonPlanSchema = z.object({
  class_diary_id: z.string().uuid('Informe um diário de classe válido.'),
  evaluation_period_id: z.string().uuid('Informe um período avaliativo válido.'),
  planned_lessons: requiredInteger('a quantidade planejada'),
  taught_lessons: optionalInteger('a quantidade ministrada'),
  goals: z.string().max(8000, 'Objetivos muito longos.').optional(),
  content: z.string().max(8000, 'Conteúdo muito longo.').optional(),
  expected_competencies: z.string().max(8000, 'Competências muito longas.').optional(),
});

export type LessonPlanFormValues = z.infer<typeof lessonPlanSchema>;

export const emptyLessonPlanForm: LessonPlanFormValues = {
  class_diary_id: '',
  evaluation_period_id: '',
  planned_lessons: '',
  taught_lessons: '',
  goals: '',
  content: '',
  expected_competencies: '',
};

export function lessonPlanToForm(plan: LessonPlan): LessonPlanFormValues {
  return {
    class_diary_id: plan.class_diary_id,
    evaluation_period_id: plan.evaluation_period_id,
    planned_lessons: String(plan.planned_lessons),
    taught_lessons: plan.taught_lessons !== null ? String(plan.taught_lessons) : '',
    goals: plan.goals ?? '',
    content: plan.content ? plan.content.join('\n') : '',
    expected_competencies: plan.expected_competencies ? plan.expected_competencies.join('\n') : '',
  };
}

export function buildLessonPlanPayload(values: LessonPlanFormValues): Record<string, unknown> {
  return {
    class_diary_id: values.class_diary_id,
    evaluation_period_id: values.evaluation_period_id,
    planned_lessons: Number(values.planned_lessons),
    taught_lessons:
      values.taught_lessons === '' || values.taught_lessons === undefined ? undefined : Number(values.taught_lessons),
    goals: normalizeText(values.goals),
    content: toStringArray(values.content),
    expected_competencies: toStringArray(values.expected_competencies),
  };
}

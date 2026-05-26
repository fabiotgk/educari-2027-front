'use client';

import { z } from 'zod';

import type { Grade, GradeKind } from './types';

const GRADE_KINDS = ['period', 'activity', 'recovery'] as const;

const normalize = (value: string | undefined): string => (value && value.trim() !== '' ? value.trim() : '');

export const gradeSchema = z.object({
  enrollment_id: z
    .string({ message: 'Informe a matrícula.' })
    .uuid('Informe um UUID válido para a matrícula.'),
  subject_id: z
    .string({ message: 'Informe a disciplina.' })
    .uuid('Informe um UUID válido para a disciplina.'),
  evaluation_period_id: z
    .string({ message: 'Informe o período avaliativo.' })
    .uuid('Informe um UUID válido para o período avaliativo.'),
  kind: z.enum(GRADE_KINDS, { error: 'Informe o tipo de nota.' }),
  activity_label: z
    .string()
    .trim()
    .max(128, 'A descrição da atividade não pode exceder 128 caracteres.')
    .optional()
    .or(z.literal('')),
  weight: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || value === undefined || !Number.isNaN(Number(value)), {
      message: 'O peso deve ser um número.',
    }),
  score_numeric: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || value === undefined || !Number.isNaN(Number(value)), {
      message: 'A nota numérica deve ser um número.',
    }),
  score_concept: z
    .string()
    .trim()
    .max(8, 'O conceito não pode exceder 8 caracteres.')
    .optional()
    .or(z.literal('')),
  score_descriptive: z
    .string()
    .trim()
    .max(500, 'A nota descritiva está muito longa.')
    .optional()
    .or(z.literal('')),
  recorded_by_user_id: z
    .string()
    .uuid('Informe um usuário válido.')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .max(2000, 'As observações não podem ter mais de 2000 caracteres.')
    .optional()
    .or(z.literal('')),
  justification: z
    .string()
    .trim()
    .min(10, 'A justificativa deve ter pelo menos 10 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type GradeFormValues = z.infer<typeof gradeSchema>;

export const emptyGradeForm: GradeFormValues = {
  enrollment_id: '',
  subject_id: '',
  evaluation_period_id: '',
  kind: 'period',
  activity_label: '',
  weight: '',
  score_numeric: '',
  score_concept: '',
  score_descriptive: '',
  recorded_by_user_id: '',
  notes: '',
  justification: '',
};

export function gradeToForm(grade: Grade): GradeFormValues {
  return {
    enrollment_id: grade.enrollment_id,
    subject_id: grade.subject_id,
    evaluation_period_id: grade.evaluation_period_id,
    kind: grade.kind,
    activity_label: grade.activity_label ?? '',
    weight: grade.weight === null ? '' : String(grade.weight),
    score_numeric: grade.score_numeric === null ? '' : String(grade.score_numeric),
    score_concept: grade.score_concept ?? '',
    score_descriptive: grade.score_descriptive ?? '',
    recorded_by_user_id: grade.recorded_by_user_id ?? '',
    notes: grade.notes ?? '',
    justification: '',
  };
}

function toOptionalNumber(value: string | undefined): number | undefined {
  const normalized = normalize(value);
  if (normalized === '') return undefined;

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function toOptionalText(value: string | undefined): string | undefined {
  const normalized = normalize(value);
  return normalized === '' ? undefined : normalized;
}

export function buildGradePayload(values: GradeFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    enrollment_id: values.enrollment_id,
    subject_id: values.subject_id,
    evaluation_period_id: values.evaluation_period_id,
    kind: values.kind as GradeKind,
  };

  const activityLabel = toOptionalText(values.activity_label);
  if (activityLabel !== undefined) {
    payload.activity_label = activityLabel;
  }

  const weight = toOptionalNumber(values.weight);
  if (weight !== undefined) {
    payload.weight = weight;
  }

  const scoreNumeric = toOptionalNumber(values.score_numeric);
  if (scoreNumeric !== undefined) {
    payload.score_numeric = scoreNumeric;
  }

  const scoreConcept = toOptionalText(values.score_concept);
  if (scoreConcept !== undefined) {
    payload.score_concept = scoreConcept;
  }

  const scoreDescriptive = toOptionalText(values.score_descriptive);
  if (scoreDescriptive !== undefined) {
    payload.score_descriptive = scoreDescriptive;
  }

  const recordedBy = toOptionalText(values.recorded_by_user_id);
  if (recordedBy !== undefined) {
    payload.recorded_by_user_id = recordedBy;
  }

  const notes = toOptionalText(values.notes);
  if (notes !== undefined) {
    payload.notes = notes;
  }

  const justification = toOptionalText(values.justification);
  if (justification !== undefined) {
    payload.justification = justification;
  }

  return payload;
}

import { z } from 'zod';

import type { TeachingRecord } from './types';

const toStringArray = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

const blank = (value: string | undefined) => (value && value.trim() !== '' ? value.trim() : undefined);
const integer = (label: string) =>
  z.string().trim().min(1, `Informe ${label} da aula.`).refine((value) => /^\d+$/.test(value), {
    message: `Informe ${label} em formato numérico inteiro.`,
  });

export const teachingRecordSchema = z.object({
  class_diary_id: z.string().uuid('Informe um diário válido.'),
  lesson_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data no formato AAAA-MM-DD.'),
  lesson_number_in_day: integer('o número da aula'),
  content_taught: z.string().min(1, 'Informe o conteúdo ministrado.'),
  methodology: z.string().max(10000).optional(),
  observations: z.string().max(10000).optional(),
  learning_expectations: z.string().max(10000).optional(),
  is_substituted: z.boolean(),
  substituted_for_record_id: z.string().uuid('Informe um registro válido.').or(z.literal('')).optional(),
});

export type TeachingRecordFormValues = z.infer<typeof teachingRecordSchema>;

export const emptyTeachingRecordForm: TeachingRecordFormValues = {
  class_diary_id: '',
  lesson_date: '',
  lesson_number_in_day: '',
  content_taught: '',
  methodology: '',
  observations: '',
  learning_expectations: '',
  is_substituted: false,
  substituted_for_record_id: '',
};

export function teachingRecordToForm(record: TeachingRecord): TeachingRecordFormValues {
  return {
    class_diary_id: record.class_diary_id,
    lesson_date: record.lesson_date,
    lesson_number_in_day: String(record.lesson_number_in_day),
    content_taught: record.content_taught,
    methodology: record.methodology ?? '',
    observations: record.observations ?? '',
    learning_expectations: record.learning_expectations ? record.learning_expectations.join('\n') : '',
    is_substituted: record.is_substituted,
    substituted_for_record_id: record.substituted_for_record_id ?? '',
  };
}

export function buildTeachingRecordPayload(values: TeachingRecordFormValues): Record<string, unknown> {
  return {
    class_diary_id: values.class_diary_id,
    lesson_date: values.lesson_date,
    lesson_number_in_day: Number(values.lesson_number_in_day),
    content_taught: values.content_taught.trim(),
    methodology: blank(values.methodology),
    observations: blank(values.observations),
    learning_expectations: toStringArray(values.learning_expectations),
    is_substituted: values.is_substituted,
    substituted_for_record_id:
      values.is_substituted && values.substituted_for_record_id ? values.substituted_for_record_id : undefined,
  };
}

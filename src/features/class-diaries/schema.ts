import { z } from 'zod';

import type { ClassDiary } from './types';

export const classDiarySchema = z.object({
  class_id: z.string().uuid('Informe um UUID válido para a turma.'),
  subject_id: z.string().uuid('Informe um UUID válido para o componente curricular.'),
  teacher_user_id: z.string().uuid('Informe um UUID válido para o professor.'),
  academic_year: z.string().regex(/^\d{4}$/, 'O ano letivo deve ter 4 dígitos.'),
  is_active: z.boolean(),
});

export type ClassDiaryFormValues = z.infer<typeof classDiarySchema>;

export const emptyClassDiaryForm: ClassDiaryFormValues = {
  class_id: '',
  subject_id: '',
  teacher_user_id: '',
  academic_year: String(new Date().getFullYear()),
  is_active: true,
};

export function classDiaryToForm(diary: ClassDiary): ClassDiaryFormValues {
  return {
    class_id: diary.class_id,
    subject_id: diary.subject_id,
    teacher_user_id: diary.teacher_user_id,
    academic_year: diary.academic_year,
    is_active: diary.is_active,
  };
}

export function buildClassDiaryPayload(values: ClassDiaryFormValues): Record<string, unknown> {
  return {
    class_id: values.class_id,
    subject_id: values.subject_id,
    teacher_user_id: values.teacher_user_id,
    academic_year: values.academic_year.trim(),
    is_active: values.is_active,
  };
}

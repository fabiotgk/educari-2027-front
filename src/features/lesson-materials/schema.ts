import { z } from 'zod';

import type { LessonMaterial } from './types';

export const lessonMaterialSchema = z.object({
  lesson_id: z.string().uuid('Selecione uma aula válida.'),
  title: z.string().min(1, 'O título do material é obrigatório.').max(255),
  file_url: z.string().min(1, 'A URL do arquivo é obrigatória.').max(2048),
  file_type: z.string().max(64).optional(),
  file_size_kb: z.string().optional(),
  position: z.string().optional(),
});

export type LessonMaterialFormValues = z.infer<typeof lessonMaterialSchema>;

export const emptyLessonMaterialForm: LessonMaterialFormValues = {
  lesson_id: '',
  title: '',
  file_url: '',
  file_type: '',
  file_size_kb: '',
  position: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function lessonMaterialToForm(m: LessonMaterial): LessonMaterialFormValues {
  return {
    lesson_id: m.lesson_id,
    title: m.title,
    file_url: m.file_url,
    file_type: m.file_type ?? '',
    file_size_kb: m.file_size_kb != null ? String(m.file_size_kb) : '',
    position: m.position != null ? String(m.position) : '',
  };
}

export function buildLessonMaterialPayload(v: LessonMaterialFormValues): Record<string, unknown> {
  return {
    lesson_id: v.lesson_id,
    title: v.title.trim(),
    file_url: v.file_url.trim(),
    file_type: blank(v.file_type),
    file_size_kb: blank(v.file_size_kb) !== undefined ? Number(v.file_size_kb) : undefined,
    position: blank(v.position) !== undefined ? Number(v.position) : undefined,
  };
}

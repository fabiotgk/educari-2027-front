import { z } from 'zod';

import type { Lesson } from './types';

const CONTENT_TYPES = ['video', 'text', 'pdf', 'scorm', 'link', 'quiz'] as const;

export const lessonSchema = z.object({
  course_module_id: z.string().uuid('Selecione um módulo válido.'),
  title: z.string().min(1, 'O título da aula é obrigatório.').max(255),
  content_type: z.enum(CONTENT_TYPES).optional(),
  content_url: z.string().max(2048).optional(),
  content_body: z.string().max(50000).optional(),
  duration_minutes: z.string().optional(),
  position: z.string().optional(),
  is_preview: z.boolean(),
  is_published: z.boolean(),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

export const emptyLessonForm: LessonFormValues = {
  course_module_id: '',
  title: '',
  content_type: 'text',
  content_url: '',
  content_body: '',
  duration_minutes: '',
  position: '',
  is_preview: false,
  is_published: false,
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function lessonToForm(l: Lesson): LessonFormValues {
  return {
    course_module_id: l.course_module_id,
    title: l.title,
    content_type: l.content_type ?? 'text',
    content_url: l.content_url ?? '',
    content_body: l.content_body ?? '',
    duration_minutes: l.duration_minutes != null ? String(l.duration_minutes) : '',
    position: l.position != null ? String(l.position) : '',
    is_preview: l.is_preview,
    is_published: l.is_published,
  };
}

export function buildLessonPayload(v: LessonFormValues): Record<string, unknown> {
  return {
    course_module_id: v.course_module_id,
    title: v.title.trim(),
    content_type: v.content_type,
    content_url: blank(v.content_url),
    content_body: blank(v.content_body),
    duration_minutes: blank(v.duration_minutes) !== undefined ? Number(v.duration_minutes) : undefined,
    position: blank(v.position) !== undefined ? Number(v.position) : undefined,
    is_preview: v.is_preview,
    is_published: v.is_published,
  };
}

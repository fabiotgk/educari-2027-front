import { z } from 'zod';

import type { CourseAnnouncement } from './types';

export const courseAnnouncementSchema = z.object({
  course_id: z.string().uuid('Selecione um curso válido.'),
  title: z.string().min(1, 'O título do aviso é obrigatório.').max(255),
  body: z.string().min(1, 'O conteúdo do aviso é obrigatório.').max(20000),
  is_pinned: z.boolean(),
  published_at: z.string().optional(),
});

export type CourseAnnouncementFormValues = z.infer<typeof courseAnnouncementSchema>;

export const emptyCourseAnnouncementForm: CourseAnnouncementFormValues = {
  course_id: '',
  title: '',
  body: '',
  is_pinned: false,
  published_at: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
const dateTimeLocal = (v: string | null) => (v ? v.slice(0, 16) : '');

export function courseAnnouncementToForm(a: CourseAnnouncement): CourseAnnouncementFormValues {
  return {
    course_id: a.course_id,
    title: a.title,
    body: a.body,
    is_pinned: a.is_pinned,
    published_at: dateTimeLocal(a.published_at),
  };
}

export function buildCourseAnnouncementPayload(v: CourseAnnouncementFormValues): Record<string, unknown> {
  return {
    course_id: v.course_id,
    title: v.title.trim(),
    body: v.body.trim(),
    is_pinned: v.is_pinned,
    published_at: blank(v.published_at),
  };
}

import { z } from 'zod';

import type { CourseModule } from './types';

export const courseModuleSchema = z.object({
  course_id: z.string().uuid('Selecione um curso válido.'),
  title: z.string().min(1, 'O título do módulo é obrigatório.').max(255),
  description: z.string().max(10000).optional(),
  position: z.string().optional(),
  is_published: z.boolean(),
});

export type CourseModuleFormValues = z.infer<typeof courseModuleSchema>;

export const emptyCourseModuleForm: CourseModuleFormValues = {
  course_id: '',
  title: '',
  description: '',
  position: '',
  is_published: false,
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function courseModuleToForm(m: CourseModule): CourseModuleFormValues {
  return {
    course_id: m.course_id,
    title: m.title,
    description: m.description ?? '',
    position: m.position != null ? String(m.position) : '',
    is_published: m.is_published,
  };
}

export function buildCourseModulePayload(v: CourseModuleFormValues): Record<string, unknown> {
  return {
    course_id: v.course_id,
    title: v.title.trim(),
    description: blank(v.description),
    position: blank(v.position) !== undefined ? Number(v.position) : undefined,
    is_published: v.is_published,
  };
}

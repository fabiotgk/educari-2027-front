import { z } from 'zod';

import type { Course } from './types';

const COURSE_LEVELS = ['basico', 'intermediario', 'avancado'] as const;
const COURSE_STATUSES = ['draft', 'published', 'archived'] as const;

export const courseSchema = z
  .object({
    title: z.string().min(1, 'O título do curso é obrigatório.').max(255),
    slug: z.string().min(1, 'O slug do curso é obrigatório.').max(255),
    description: z.string().max(10000).optional(),
    cover_image: z.string().max(2048).optional(),
    category: z.string().max(128).optional(),
    workload_hours: z.string().optional(),
    level: z.enum(COURSE_LEVELS).optional(),
    status: z.enum(COURSE_STATUSES).optional(),
    is_self_paced: z.boolean(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    instructor_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
    published_at: z.string().optional(),
  })
  .refine((v) => !v.starts_at || !v.ends_at || v.ends_at >= v.starts_at, {
    path: ['ends_at'],
    message: 'A data de término deve ser igual ou posterior ao início.',
  });

export type CourseFormValues = z.infer<typeof courseSchema>;

export const emptyCourseForm: CourseFormValues = {
  title: '',
  slug: '',
  description: '',
  cover_image: '',
  category: '',
  workload_hours: '',
  level: 'basico',
  status: 'draft',
  is_self_paced: true,
  starts_at: '',
  ends_at: '',
  instructor_id: '',
  published_at: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
const dateTimeLocal = (v: string | null) => (v ? v.slice(0, 16) : '');
const dateOnly = (v: string | null) => (v ? v.slice(0, 10) : '');

export function courseToForm(c: Course): CourseFormValues {
  return {
    title: c.title,
    slug: c.slug,
    description: c.description ?? '',
    cover_image: c.cover_image ?? '',
    category: c.category ?? '',
    workload_hours: c.workload_hours != null ? String(c.workload_hours) : '',
    level: c.level ?? 'basico',
    status: c.status ?? 'draft',
    is_self_paced: c.is_self_paced,
    starts_at: dateOnly(c.starts_at),
    ends_at: dateOnly(c.ends_at),
    instructor_id: c.instructor_id ?? '',
    published_at: dateTimeLocal(c.published_at),
  };
}

export function buildCoursePayload(v: CourseFormValues): Record<string, unknown> {
  return {
    title: v.title.trim(),
    slug: v.slug.trim(),
    description: blank(v.description),
    cover_image: blank(v.cover_image),
    category: blank(v.category),
    workload_hours: blank(v.workload_hours) !== undefined ? Number(v.workload_hours) : undefined,
    level: v.level,
    status: v.status,
    is_self_paced: v.is_self_paced,
    starts_at: blank(v.starts_at),
    ends_at: blank(v.ends_at),
    instructor_id: blank(v.instructor_id),
    published_at: blank(v.published_at),
  };
}

import { z } from 'zod';

import type { ForumThread } from './types';

export const forumThreadSchema = z.object({
  title: z.string().min(1, 'O título do tópico é obrigatório.').max(255),
  body: z.string().min(1, 'O conteúdo do tópico é obrigatório.').max(10000),
  course_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
  is_pinned: z.boolean(),
  is_locked: z.boolean(),
});

export type ForumThreadFormValues = z.infer<typeof forumThreadSchema>;

export const emptyForumThreadForm: ForumThreadFormValues = {
  title: '',
  body: '',
  course_id: '',
  is_pinned: false,
  is_locked: false,
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function forumThreadToForm(thread: ForumThread): ForumThreadFormValues {
  return {
    title: thread.title,
    body: thread.body,
    course_id: thread.course_id ?? '',
    is_pinned: thread.is_pinned,
    is_locked: thread.is_locked,
  };
}

export function buildForumThreadPayload(v: ForumThreadFormValues): Record<string, unknown> {
  return {
    title: v.title.trim(),
    body: v.body.trim(),
    course_id: blank(v.course_id),
    is_pinned: v.is_pinned,
    is_locked: v.is_locked,
  };
}

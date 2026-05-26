import { z } from 'zod';

import type { ForumReply } from './types';

export const forumReplySchema = z.object({
  forum_thread_id: z.string().uuid('Informe um UUID válido.'),
  body: z.string().min(1, 'O conteúdo da resposta é obrigatório.').max(10000),
  parent_reply_id: z.string().uuid('Informe um UUID válido.').optional().or(z.literal('')),
  is_solution: z.boolean(),
});

export type ForumReplyFormValues = z.infer<typeof forumReplySchema>;

export const emptyForumReplyForm: ForumReplyFormValues = {
  forum_thread_id: '',
  body: '',
  parent_reply_id: '',
  is_solution: false,
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function forumReplyToForm(reply: ForumReply): ForumReplyFormValues {
  return {
    forum_thread_id: reply.forum_thread_id,
    body: reply.body,
    parent_reply_id: reply.parent_reply_id ?? '',
    is_solution: reply.is_solution,
  };
}

export function buildCreateForumReplyPayload(v: ForumReplyFormValues): Record<string, unknown> {
  return {
    body: v.body.trim(),
    parent_reply_id: blank(v.parent_reply_id),
  };
}

export function buildUpdateForumReplyPayload(v: ForumReplyFormValues): Record<string, unknown> {
  return {
    body: v.body.trim(),
    is_solution: v.is_solution,
  };
}

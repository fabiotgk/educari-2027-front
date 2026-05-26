import { z } from 'zod';

import type { ForumSubscription } from './types';

export const forumSubscriptionSchema = z.object({
  forum_thread_id: z.string().uuid('Informe um UUID válido.'),
  notify: z.boolean(),
});

export type ForumSubscriptionFormValues = z.infer<typeof forumSubscriptionSchema>;

export const emptyForumSubscriptionForm: ForumSubscriptionFormValues = {
  forum_thread_id: '',
  notify: true,
};

export function forumSubscriptionToForm(subscription: ForumSubscription): ForumSubscriptionFormValues {
  return {
    forum_thread_id: subscription.forum_thread_id,
    notify: subscription.notify,
  };
}

export function buildCreateForumSubscriptionPayload(v: ForumSubscriptionFormValues): Record<string, unknown> {
  return {
    forum_thread_id: v.forum_thread_id,
    notify: v.notify,
  };
}

export function buildUpdateForumSubscriptionPayload(v: ForumSubscriptionFormValues): Record<string, unknown> {
  return {
    notify: v.notify,
  };
}

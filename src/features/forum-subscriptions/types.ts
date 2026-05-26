import type { ForumThread, LmsForumUserSummary } from '@/features/forum-threads/types';

export interface ForumSubscription {
  id: string;
  tenant_id: string;
  forum_thread_id: string;
  user_id: string | null;
  notify: boolean;
  created_at: string | null;
  updated_at: string | null;
  thread?: ForumThread | null;
  user?: LmsForumUserSummary | null;
}

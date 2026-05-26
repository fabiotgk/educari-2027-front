import type { ForumThread, LmsForumUserSummary } from '@/features/forum-threads/types';

export interface ForumReply {
  id: string;
  tenant_id: string;
  forum_thread_id: string;
  author_id: string | null;
  parent_reply_id: string | null;
  body: string;
  is_solution: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  author?: LmsForumUserSummary | null;
  thread?: ForumThread | null;
  parent_reply?: ForumReply | null;
}

export interface LmsForumUserSummary {
  id: string;
  name: string;
  email?: string | null;
}

export interface ForumThread {
  id: string;
  tenant_id: string;
  course_id: string | null;
  author_id: string | null;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number | null;
  replies_count: number | null;
  last_reply_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  author?: LmsForumUserSummary | null;
}

export interface ForumReplyRow {
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
}

export interface ForumSubscriptionRow {
  id: string;
  tenant_id: string;
  forum_thread_id: string;
  user_id: string | null;
  notify: boolean;
  created_at: string | null;
  updated_at: string | null;
  user?: LmsForumUserSummary | null;
}

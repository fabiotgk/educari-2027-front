import type { Metadata } from 'next';

import { ForumRepliesPage } from '@/features/forum-replies/forum-replies-page';

export const metadata: Metadata = { title: 'Respostas do fórum · AVA / LMS' };

export default function RespostasForumPage() {
  return <ForumRepliesPage />;
}

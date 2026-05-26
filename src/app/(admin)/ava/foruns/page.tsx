import type { Metadata } from 'next';

import { ForumThreadsPage } from '@/features/forum-threads/forum-threads-page';

export const metadata: Metadata = { title: 'Fóruns · AVA / LMS' };

export default function ForunsPage() {
  return <ForumThreadsPage />;
}

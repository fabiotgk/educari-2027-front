import type { Metadata } from 'next';

import { ForumThreadFormPage } from '@/features/forum-threads/forum-thread-form';

export const metadata: Metadata = { title: 'Novo tópico · AVA / LMS' };

export default function NovoTopicoForumPage() {
  return <ForumThreadFormPage />;
}

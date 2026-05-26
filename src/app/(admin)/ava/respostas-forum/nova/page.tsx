import type { Metadata } from 'next';

import { ForumReplyFormPage } from '@/features/forum-replies/forum-reply-form';

export const metadata: Metadata = { title: 'Nova resposta · AVA / LMS' };

export default function NovaRespostaForumPage() {
  return <ForumReplyFormPage />;
}

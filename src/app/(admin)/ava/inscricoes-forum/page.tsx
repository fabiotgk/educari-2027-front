import type { Metadata } from 'next';

import { ForumSubscriptionsPage } from '@/features/forum-subscriptions/forum-subscriptions-page';

export const metadata: Metadata = { title: 'Inscrições do fórum · AVA / LMS' };

export default function InscricoesForumPage() {
  return <ForumSubscriptionsPage />;
}

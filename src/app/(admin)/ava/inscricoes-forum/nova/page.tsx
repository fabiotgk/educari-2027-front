import type { Metadata } from 'next';

import { ForumSubscriptionFormPage } from '@/features/forum-subscriptions/forum-subscription-form';

export const metadata: Metadata = { title: 'Nova inscrição · AVA / LMS' };

export default function NovaInscricaoForumPage() {
  return <ForumSubscriptionFormPage />;
}

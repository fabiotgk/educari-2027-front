import { ForumSubscriptionFormPage } from '@/features/forum-subscriptions/forum-subscription-form';

export default async function EditarInscricaoForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ForumSubscriptionFormPage subscriptionId={id} />;
}

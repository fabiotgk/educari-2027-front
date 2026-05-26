import { ForumSubscriptionDetailPage } from '@/features/forum-subscriptions/forum-subscription-detail';

export default async function InscricaoForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ForumSubscriptionDetailPage id={id} />;
}

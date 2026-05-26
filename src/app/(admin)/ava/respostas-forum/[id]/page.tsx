import { ForumReplyDetailPage } from '@/features/forum-replies/forum-reply-detail';

export default async function RespostaForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ForumReplyDetailPage id={id} />;
}

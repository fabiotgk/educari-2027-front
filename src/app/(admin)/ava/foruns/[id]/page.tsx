import { ForumThreadDetailPage } from '@/features/forum-threads/forum-thread-detail';

export default async function TopicoForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ForumThreadDetailPage id={id} />;
}

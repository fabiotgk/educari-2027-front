import { ForumThreadFormPage } from '@/features/forum-threads/forum-thread-form';

export default async function EditarTopicoForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ForumThreadFormPage threadId={id} />;
}

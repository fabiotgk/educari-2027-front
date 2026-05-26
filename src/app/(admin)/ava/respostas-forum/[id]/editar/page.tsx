import { ForumReplyFormPage } from '@/features/forum-replies/forum-reply-form';

export default async function EditarRespostaForumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ForumReplyFormPage replyId={id} />;
}

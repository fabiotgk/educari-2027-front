import { LmsQuestionDetailPage } from '@/features/lms-questions/lms-question-detail';

export default async function QuestaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LmsQuestionDetailPage id={id} />;
}

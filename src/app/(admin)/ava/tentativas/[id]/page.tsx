import { QuizAttemptDetailPage } from '@/features/quiz-attempts/quiz-attempt-detail';

export default async function TentativaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizAttemptDetailPage id={id} />;
}

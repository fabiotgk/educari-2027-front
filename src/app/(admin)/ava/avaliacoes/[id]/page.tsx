import { LmsQuizDetailPage } from '@/features/lms-quizzes/lms-quiz-detail';

export default async function AvaliacaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LmsQuizDetailPage id={id} />;
}

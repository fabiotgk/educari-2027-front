import { QuizAnswerDetailPage } from '@/features/quiz-answers/quiz-answer-detail';

export default async function RespostaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizAnswerDetailPage id={id} />;
}

import { LmsQuizFormPage } from '@/features/lms-quizzes/lms-quiz-form';

export default async function EditarAvaliacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LmsQuizFormPage quizId={id} />;
}

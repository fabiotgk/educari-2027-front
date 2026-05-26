import { QuizAttemptFormPage } from '@/features/quiz-attempts/quiz-attempt-form';

export default async function EditarTentativaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizAttemptFormPage attemptId={id} />;
}

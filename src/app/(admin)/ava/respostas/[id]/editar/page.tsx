import { QuizAnswerFormPage } from '@/features/quiz-answers/quiz-answer-form';

export default async function EditarRespostaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizAnswerFormPage answerId={id} />;
}

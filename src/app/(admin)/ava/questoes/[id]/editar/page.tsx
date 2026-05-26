import { LmsQuestionFormPage } from '@/features/lms-questions/lms-question-form';

export default async function EditarQuestaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LmsQuestionFormPage questionId={id} />;
}

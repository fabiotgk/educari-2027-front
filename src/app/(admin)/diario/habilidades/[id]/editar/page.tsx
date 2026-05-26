import { LearningExpectationFormPage } from '@/features/learning-expectations/learning-expectation-form';

export default async function EditarHabilidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LearningExpectationFormPage learningExpectationId={id} />;
}

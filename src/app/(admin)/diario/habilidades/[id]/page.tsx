import { LearningExpectationDetailPage } from '@/features/learning-expectations/learning-expectation-detail';

export default async function HabilidadeDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LearningExpectationDetailPage id={id} />;
}

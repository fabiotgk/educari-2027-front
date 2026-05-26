import { EssayEvaluationDetailPage } from '@/features/essay-evaluations/essay-evaluation-detail';

export default async function AvaliacaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EssayEvaluationDetailPage id={id} />;
}

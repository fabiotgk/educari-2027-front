import { EvaluationPeriodDetailPage } from '@/features/evaluation-periods/evaluation-period-detail';

export default async function PeriodoAvaliativoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvaluationPeriodDetailPage id={id} />;
}


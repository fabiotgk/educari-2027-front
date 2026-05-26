import { EvaluationPeriodFormPage } from '@/features/evaluation-periods/evaluation-period-form';

export default async function EditarPeriodoAvaliativoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvaluationPeriodFormPage evaluationPeriodId={id} />;
}


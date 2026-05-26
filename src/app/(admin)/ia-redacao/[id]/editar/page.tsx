import { EssayEvaluationFormPage } from '@/features/essay-evaluations/essay-evaluation-form';

export default async function EditarAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EssayEvaluationFormPage resourceId={id} />;
}

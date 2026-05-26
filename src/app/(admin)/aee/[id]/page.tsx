import { PdiPlanDetailPage } from '@/features/pdi-plans/pdi-plan-detail';

export default async function PdiPlanDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PdiPlanDetailPage id={id} />;
}

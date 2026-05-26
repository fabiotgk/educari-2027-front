import { FinancialProgramDetailPage } from '@/features/financial-programs/financial-program-detail';

export default async function FinancialProgramDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FinancialProgramDetailPage id={id} />;
}

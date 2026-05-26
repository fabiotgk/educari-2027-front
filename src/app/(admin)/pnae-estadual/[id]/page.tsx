import { StateMealProgramDetailPage } from '@/features/state-meal-programs/state-meal-program-detail';

export default async function ProgramaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StateMealProgramDetailPage id={id} />;
}

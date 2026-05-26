import { StateMealProgramFormPage } from '@/features/state-meal-programs/state-meal-program-form';

export default async function EditarProgramaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StateMealProgramFormPage resourceId={id} />;
}

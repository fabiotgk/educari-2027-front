import { GuardianFormPage } from '@/features/guardians/guardian-form';

export default async function EditarResponsavelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuardianFormPage guardianId={id} />;
}

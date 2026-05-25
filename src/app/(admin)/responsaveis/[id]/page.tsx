import { GuardianDetailPage } from '@/features/guardians/guardian-detail';

export default async function ResponsavelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuardianDetailPage id={id} />;
}

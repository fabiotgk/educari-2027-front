import { DistanceCenterFormPage } from '@/features/distance-centers/distance-center-form';

export default async function EditarPoloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DistanceCenterFormPage centerId={id} />;
}

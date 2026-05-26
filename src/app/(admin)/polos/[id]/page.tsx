import { DistanceCenterDetailPage } from '@/features/distance-centers/distance-center-detail';

export default async function PoloDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DistanceCenterDetailPage id={id} />;
}

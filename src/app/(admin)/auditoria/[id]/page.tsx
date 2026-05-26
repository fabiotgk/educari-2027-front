import { AccessGrantDetailPage } from '@/features/access-grants/access-grant-detail';

export default async function ConcessaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AccessGrantDetailPage id={id} />;
}

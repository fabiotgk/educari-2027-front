import { AssetDetailPage } from '@/features/assets/asset-detail';

export default async function PatrimonioItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssetDetailPage id={id} />;
}

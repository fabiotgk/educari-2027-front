import { AssetFormPage } from '@/features/assets/asset-form';

export default async function EditarBemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssetFormPage assetId={id} />;
}

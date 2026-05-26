import { SupplierDetailPage } from '@/features/suppliers/supplier-detail';

export default async function FornecedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupplierDetailPage id={id} />;
}

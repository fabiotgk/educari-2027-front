import { TransferEventDetailPage } from '@/features/transfer-events/transfer-event-detail';

export default async function RemocaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransferEventDetailPage id={id} />;
}

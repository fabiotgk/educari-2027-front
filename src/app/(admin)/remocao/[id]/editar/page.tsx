import { TransferEventFormPage } from '@/features/transfer-events/transfer-event-form';

export default async function EditarRemocaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransferEventFormPage eventId={id} />;
}

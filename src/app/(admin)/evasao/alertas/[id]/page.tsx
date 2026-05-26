import { EvasionAlertDetailPage } from '@/features/evasion-alerts/evasion-alert-detail';

export default async function EvasionAlertDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EvasionAlertDetailPage id={id} />;
}

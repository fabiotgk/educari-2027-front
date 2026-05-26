import { EvasionAlertFormPage } from '@/features/evasion-alerts/evasion-alert-form';

export default async function EditarAlertaEvasaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EvasionAlertFormPage alertId={id} />;
}

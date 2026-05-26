import { EvasionOccurrenceFormPage } from '@/features/evasion-occurrences/evasion-occurrence-form';

export default async function EditarOcorrenciaEvasaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EvasionOccurrenceFormPage occurrenceId={id} />;
}

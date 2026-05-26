import { EvasionOccurrenceDetailPage } from '@/features/evasion-occurrences/evasion-occurrence-detail';

export default async function EvasionOccurrenceDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EvasionOccurrenceDetailPage id={id} />;
}

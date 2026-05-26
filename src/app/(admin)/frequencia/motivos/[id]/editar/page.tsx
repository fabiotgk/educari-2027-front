import { AbsenceReasonFormPage } from '@/features/absence-reasons/absence-reason-form';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AbsenceReasonFormPage reasonId={id} />;
}

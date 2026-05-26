import { AbsenceReasonDetailPage } from '@/features/absence-reasons/absence-reason-detail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AbsenceReasonDetailPage id={id} />;
}

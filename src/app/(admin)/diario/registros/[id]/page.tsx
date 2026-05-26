import { TeachingRecordDetailPage } from '@/features/teaching-records/teaching-record-detail';

export default async function RegistroAulaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeachingRecordDetailPage id={id} />;
}


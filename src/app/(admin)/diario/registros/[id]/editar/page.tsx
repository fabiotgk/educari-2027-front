import { TeachingRecordFormPage } from '@/features/teaching-records/teaching-record-form';

export default async function EditarRegistroAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeachingRecordFormPage teachingRecordId={id} />;
}


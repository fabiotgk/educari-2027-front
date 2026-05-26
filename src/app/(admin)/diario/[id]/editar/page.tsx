import { ClassDiaryFormPage } from '@/features/class-diaries/class-diary-form';

export default async function EditarDiarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassDiaryFormPage diaryId={id} />;
}


import { ClassDiaryDetailPage } from '@/features/class-diaries/class-diary-detail';

export default async function DiarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassDiaryDetailPage id={id} />;
}


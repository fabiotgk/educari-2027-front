import { LessonDetailPage } from '@/features/lessons/lesson-detail';

export default async function AulaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonDetailPage id={id} />;
}

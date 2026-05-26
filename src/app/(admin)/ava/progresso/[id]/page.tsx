import { LessonProgressDetailPage } from '@/features/lesson-progress/lesson-progress-detail';

export default async function ProgressoAvaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonProgressDetailPage id={id} />;
}

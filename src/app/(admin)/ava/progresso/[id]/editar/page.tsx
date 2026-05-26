import { LessonProgressFormPage } from '@/features/lesson-progress/lesson-progress-form';

export default async function EditarProgressoAvaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonProgressFormPage lessonProgressId={id} />;
}

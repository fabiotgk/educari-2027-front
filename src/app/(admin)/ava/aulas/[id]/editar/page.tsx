import { LessonFormPage } from '@/features/lessons/lesson-form';

export default async function EditarAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonFormPage lessonId={id} />;
}

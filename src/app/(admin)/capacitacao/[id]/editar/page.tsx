import { TrainingCourseFormPage } from '@/features/training-courses/training-course-form';

export default async function EditarCapacitacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TrainingCourseFormPage courseId={id} />;
}

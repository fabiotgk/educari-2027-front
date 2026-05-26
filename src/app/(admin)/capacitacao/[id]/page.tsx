import { TrainingCourseDetailPage } from '@/features/training-courses/training-course-detail';

export default async function CapacitacaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TrainingCourseDetailPage id={id} />;
}
